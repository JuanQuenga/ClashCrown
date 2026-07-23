import { makeFunctionReference } from "convex/server";
import type { CardsPayload, ClanBundlePayload, PlayerBundlePayload } from "@/lib/clash/types";

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

export function errorMessage(error: unknown) {
  if (error instanceof Error) {
    const data = (error as Error & { data?: { message?: string } }).data;
    return data?.message ?? error.message.replace(/^\[CONVEX[^\]]*\]\s*/, "");
  }
  return "Something went wrong while loading Clash Royale data.";
}
