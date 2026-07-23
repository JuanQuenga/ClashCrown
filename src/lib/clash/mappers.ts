import type { Battle, Card, Chest, Clan, ClanMember, Player } from "@/lib/mock-data";
import type {
  ApiBattle,
  ApiCard,
  ApiCardList,
  ApiChestList,
  ApiClan,
  ApiPlayer,
  CardsPayload,
  ClanBundlePayload,
  PlayerBundlePayload
} from "./types";

const FALLBACK_CARD: Card = {
  name: "Unknown Card",
  elixir: 0,
  rarity: "Common",
  image: "/images/cards/unknown.png"
};

const rarityMap: Record<string, Card["rarity"]> = {
  common: "Common",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
  champion: "Champion"
};

const chestImages: Record<string, string> = {
  "silver chest": "silverchest",
  "golden chest": "goldenchest",
  "giant chest": "giantchest",
  "epic chest": "epicchest",
  "legendary chest": "legendarychest",
  "mega lightning chest": "megalightningchest",
  "royal wild chest": "royalwildchest",
  "gold crate": "goldcrate",
  "plentiful gold crate": "plentifulgoldcrate",
  "overflowing gold crate": "overflowinggoldcrate"
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replaceAll(".", "")
    .replaceAll("'", "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function mapCard(card?: ApiCard): Card {
  if (!card?.name) return FALLBACK_CARD;

  return {
    id: card.id,
    name: card.name,
    elixir: card.elixirCost ?? 0,
    rarity: rarityMap[card.rarity?.toLowerCase() ?? ""] ?? "Common",
    image: `/images/cards/${slugify(card.name)}.png`
  };
}

function formatBattleDate(value?: string) {
  if (!value) return "Recent battle";
  const match = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/);
  if (!match) return value;
  const [, year, month, day, hour, minute, second] = match;
  const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`);
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function mapBattle(battle: ApiBattle): Battle {
  const team = battle.team?.[0];
  const opponent = battle.opponent?.[0];
  const ourCrowns = team?.crowns ?? 0;
  const theirCrowns = opponent?.crowns ?? 0;

  return {
    mode: battle.gameMode?.name ?? battle.type ?? "Battle",
    date: formatBattleDate(battle.battleTime),
    result: ourCrowns >= theirCrowns ? "Win" : "Loss",
    crowns: [ourCrowns, theirCrowns],
    opponent: opponent?.name ?? "Unknown player",
    opponentClan: opponent?.clan?.name,
    opponentDeck: opponent?.cards?.map(mapCard),
    trophyChange: team?.trophyChange ?? 0,
    deck: team?.cards?.map(mapCard) ?? []
  };
}

function mapChestList(payload: ApiChestList): Chest[] {
  return (payload.items ?? []).map((chest) => {
    const name = chest.name ?? "Chest";
    const image = chestImages[name.toLowerCase()] ?? "woodenchest";
    return { name, index: chest.index ?? 0, image: `/images/chests/${image}.png` };
  });
}

export function mapPlayerBundle(payload: PlayerBundlePayload): Player {
  const source = payload.player.data;
  const currentDeck = source.currentDeck?.map(mapCard) ?? [];
  const allCards = source.cards?.map(mapCard) ?? currentDeck;
  const favoriteCard = mapCard(source.currentFavouriteCard ?? source.currentDeck?.[0]);

  return {
    tag: source.tag.replace(/^#/, ""),
    name: source.name,
    level: source.expLevel ?? 1,
    trophies: source.trophies ?? 0,
    bestTrophies: source.bestTrophies ?? source.trophies ?? 0,
    arena: source.arena?.name ?? "Unknown Arena",
    arenaImage: "/images/arenas/league9.png",
    clan: source.clan?.name ?? "No clan",
    favoriteCard,
    stats: {
      "Last known trophies": (source.trophies ?? 0).toLocaleString(),
      "Challenge cards won": (source.challengeCardsWon ?? 0).toLocaleString(),
      "Challenge max wins": (source.challengeMaxWins ?? 0).toLocaleString(),
      "Tourney cards won": (source.tournamentCardsWon ?? 0).toLocaleString(),
      "Total donations": (source.totalDonations ?? source.donations ?? 0).toLocaleString(),
      "War day wins": (source.warDayWins ?? 0).toLocaleString(),
      Wins: (source.wins ?? 0).toLocaleString(),
      Losses: (source.losses ?? 0).toLocaleString(),
      "3 crown wins": (source.threeCrownWins ?? 0).toLocaleString(),
      Battles: (source.battleCount ?? 0).toLocaleString(),
      Arena: source.arena?.name ?? "Unknown"
    },
    deck: currentDeck,
    cards: allCards,
    chests: mapChestList(payload.chests.data),
    battles: payload.battles.data.map(mapBattle),
    fetchedAt: payload.player.fetchedAt
  };
}

function roleLabel(role?: string) {
  if (!role) return "Member";
  return role.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (letter) => letter.toUpperCase());
}

function mapClanMember(member: NonNullable<ApiClan["memberList"]>[number]): ClanMember {
  return {
    tag: member.tag?.replace(/^#/, ""),
    name: member.name ?? "Unknown member",
    role: roleLabel(member.role),
    level: member.expLevel,
    rank: member.clanRank,
    trophies: member.trophies ?? 0,
    donations: member.donations ?? 0
  };
}

export function mapClanBundle(payload: ClanBundlePayload): Clan {
  const source = payload.clan.data;
  return {
    tag: source.tag.replace(/^#/, ""),
    name: source.name,
    badge: source.badgeId ? `/images/clan-badges/${source.badgeId}.png` : "/images/clan-badges/16000004.png",
    warBadge: "/images/war/gold-1.png",
    description: source.description ?? "No clan description provided.",
    score: source.clanScore ?? 0,
    warTrophies: source.clanWarTrophies ?? 0,
    requiredTrophies: source.requiredTrophies ?? 0,
    type: roleLabel(source.type),
    donations: source.donationsPerWeek ?? 0,
    members: (source.memberList ?? []).map(mapClanMember),
    fetchedAt: payload.clan.fetchedAt
  };
}

export function mapCardsPayload(payload: CardsPayload): Card[] {
  return mapCardList(payload.cards.data);
}

export function mapCardList(payload: ApiCardList): Card[] {
  return (payload.items ?? []).map(mapCard);
}
