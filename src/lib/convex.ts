import { makeFunctionReference } from "convex/server";
import type {
  CardsPayload,
  ClanBundlePayload,
  ClanSearchPayload,
  ClanWarPayload,
  LeaderboardListPayload,
  LeaderboardPayload,
  LocationsPayload,
  PlayerBundlePayload,
  RankingKind,
  RankingsPayload,
  TournamentsPayload
} from "@/lib/clash/types";

export const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL?.trim() ?? "";
export const isConvexConfigured = convexUrl.startsWith("https://");

export const playerBundleAction = makeFunctionReference<
  "action",
  { tag: string; force?: boolean },
  PlayerBundlePayload
>("clashApi:getPlayerBundle");

export const clanBundleAction = makeFunctionReference<
  "action",
  { tag: string; force?: boolean },
  ClanBundlePayload
>("clashApi:getClanBundle");

export const cardsAction = makeFunctionReference<"action", { force?: boolean }, CardsPayload>("clashApi:getCards");

export const clanWarAction = makeFunctionReference<
  "action",
  { tag: string; force?: boolean },
  ClanWarPayload
>("clashApi:getClanWar");

export const locationsAction = makeFunctionReference<"action", { force?: boolean }, LocationsPayload>(
  "clashApi:getLocations"
);

export const rankingsAction = makeFunctionReference<
  "action",
  { kind: RankingKind; locationId?: number; limit?: number; force?: boolean },
  RankingsPayload
>("clashApi:getRankings");

export const leaderboardsAction = makeFunctionReference<"action", { force?: boolean }, LeaderboardListPayload>(
  "clashApi:getLeaderboards"
);

export const leaderboardAction = makeFunctionReference<
  "action",
  { leaderboardId: number; limit?: number; force?: boolean },
  LeaderboardPayload
>("clashApi:getLeaderboard");

export const searchClansAction = makeFunctionReference<
  "action",
  { name?: string; locationId?: number; minMembers?: number; maxMembers?: number; minScore?: number; limit?: number; force?: boolean },
  ClanSearchPayload
>("clashApi:searchClans");

export const globalTournamentsAction = makeFunctionReference<"action", { force?: boolean }, TournamentsPayload>(
  "clashApi:getGlobalTournaments"
);

export const searchTournamentsAction = makeFunctionReference<
  "action",
  { name: string; limit?: number; force?: boolean },
  TournamentsPayload
>("clashApi:searchTournaments");

/** Matches GLOBAL_LOCATION_ID in convex/clashApi.ts. */
export const GLOBAL_LOCATION_ID = 57000000;

export function errorMessage(error: unknown) {
  if (error instanceof Error) {
    const data = (error as Error & { data?: { message?: string } }).data;
    return data?.message ?? error.message.replace(/^\[CONVEX[^\]]*\]\s*/, "");
  }
  return "Something went wrong while loading Clash Royale data.";
}
