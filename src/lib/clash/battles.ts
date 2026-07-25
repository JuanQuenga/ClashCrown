import { parseApiDate } from "./format";
import type { ApiBattle, ApiBattleParticipant } from "./types";

/**
 * Battle modes worth aggregating into meta statistics. Every one of these is a
 * 1v1 fought with a deck the player chose, so the deck is a real signal.
 */
export const META_MODES = ["ladder", "pathOfLegends", "challenge", "tournament", "clanWar"] as const;

export type MetaMode = (typeof META_MODES)[number];

/** `battle.type` as returned by the API, mapped onto the buckets we report on. */
const MODE_BY_TYPE: Record<string, MetaMode> = {
  PvP: "ladder",
  pathOfLegend: "pathOfLegends",
  pathOfLegend1v1: "pathOfLegends",
  challenge: "challenge",
  tournament: "tournament",
  riverRacePvP: "clanWar"
};

/**
 * Modes that hand the player a deck (draft, mirror) or change the game enough
 * that deck performance does not transfer. `deckSelection` covers the first
 * group; the rest are matched on the game mode name.
 */
const EXCLUDED_GAME_MODES = /draft|mirror|touchdown|rage|ramp|duel|megadeck|triplee?lixir/i;

export type DeckObservation = {
  /** Identifies the battle itself, not one side of it, so both players' logs dedupe to one row. */
  fingerprint: string;
  battleTime: number;
  mode: MetaMode;
  gameMode: string;
  deckHash: string;
  cardIds: number[];
  evolutionIds: number[];
  towerCardId?: number;
  won: boolean;
  crowns: number;
  opponentCrowns: number;
};

/** Stable identity for a deck. Evolved cards are distinct from their base card. */
export function deckHash(cardIds: number[], evolutionIds: number[]) {
  const evolved = new Set(evolutionIds);
  return cardIds
    .map((id) => (evolved.has(id) ? `${id}e` : `${id}`))
    .sort()
    .join("-");
}

/** UTC day bucket as `YYYYMMDD`, the grain every aggregate is stored at. */
export function dayKey(timestamp: number) {
  return Number(new Date(timestamp).toISOString().slice(0, 10).replace(/-/g, ""));
}

export function dayKeysBack(days: number, now = Date.now()) {
  return Array.from({ length: days }, (_, offset) => dayKey(now - offset * 86_400_000));
}

function side(participant: ApiBattleParticipant) {
  const cards = participant.cards ?? [];
  if (cards.length !== 8) return undefined;
  const cardIds = cards.map((card) => card.id).filter((id): id is number => typeof id === "number");
  if (cardIds.length !== 8) return undefined;

  const evolutionIds = cards
    .filter((card) => (card.evolutionLevel ?? 0) > 0)
    .map((card) => card.id)
    .filter((id): id is number => typeof id === "number");

  return {
    tag: participant.tag ?? "",
    cardIds,
    evolutionIds,
    towerCardId: participant.supportCards?.[0]?.id,
    crowns: participant.crowns ?? 0
  };
}

/**
 * Turns one battle into up to two observations — one per side. A battle we
 * fetched from either player's log yields the same pair, and the fingerprint is
 * side-independent so ingesting it twice is a no-op.
 *
 * Returns an empty array for anything that cannot inform deck statistics:
 * 2v2, draft and mirror modes, unrecognised battle types, and draws.
 */
export function battleObservations(battle: ApiBattle): DeckObservation[] {
  const mode = MODE_BY_TYPE[battle.type ?? ""];
  if (!mode) return [];

  // "collection" is the player's own deck. Anything else was handed to them.
  if (battle.deckSelection && battle.deckSelection !== "collection") return [];

  const gameMode = battle.gameMode?.name ?? "";
  if (EXCLUDED_GAME_MODES.test(gameMode)) return [];

  const team = battle.team ?? [];
  const opponent = battle.opponent ?? [];
  if (team.length !== 1 || opponent.length !== 1) return [];

  const left = side(team[0]);
  const right = side(opponent[0]);
  if (!left || !right) return [];
  if (left.crowns === right.crowns) return [];

  const battleTime = parseApiDate(battle.battleTime)?.getTime();
  if (!battleTime) return [];

  const fingerprint = `${battleTime}:${[left.tag, right.tag].sort().join("~")}`;

  return [left, right].map((self, index) => {
    const other = index === 0 ? right : left;
    return {
      fingerprint,
      battleTime,
      mode,
      gameMode,
      deckHash: deckHash(self.cardIds, self.evolutionIds),
      cardIds: self.cardIds,
      evolutionIds: self.evolutionIds,
      towerCardId: self.towerCardId,
      won: self.crowns > other.crowns,
      crowns: self.crowns,
      opponentCrowns: other.crowns
    };
  });
}

export function modeLabel(mode: MetaMode) {
  const labels: Record<MetaMode, string> = {
    ladder: "Trophy Road",
    pathOfLegends: "Path of Legends",
    challenge: "Challenges",
    tournament: "Tournaments",
    clanWar: "Clan Wars"
  };
  return labels[mode];
}
