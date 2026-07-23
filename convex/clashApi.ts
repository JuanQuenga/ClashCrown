"use node";

import { actionGeneric, anyApi } from "convex/server";
import type { GenericActionCtx, GenericDataModel } from "convex/server";
import { ConvexError, v } from "convex/values";
import { normalizeTag, tagPath } from "../src/lib/clash/tag";
import type {
  ApiBattle,
  ApiCardList,
  ApiChestList,
  ApiClan,
  ApiPlayer,
  CachedPayload,
  CardsPayload,
  ClanBundlePayload,
  PlayerBundlePayload
} from "../src/lib/clash/types";

type CacheKind = "player" | "battles" | "chests" | "clan" | "cards";

type CacheDocument = {
  key: string;
  kind: CacheKind;
  payload: string;
  fetchedAt: number;
  expiresAt: number;
  sourceVersion: string;
};

type ApiErrorBody = {
  message?: string;
  reason?: string;
};

const cacheApi = anyApi.cache;
type ActionCtx = GenericActionCtx<GenericDataModel>;

function normalizeActionTag(input: string) {
  try {
    return normalizeTag(input);
  } catch (error) {
    throw new ConvexError({
      code: "INVALID_TAG",
      message: error instanceof Error ? error.message : "Enter a valid Clash Royale tag."
    });
  }
}

function cacheTtlMs() {
  const seconds = Number(process.env.CLASH_ROYALE_CACHE_TTL_SECONDS ?? 900);
  return Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : 900_000;
}

function cachedPayload<T>(document: CacheDocument, stale = false): CachedPayload<T> {
  return {
    data: JSON.parse(document.payload) as T,
    fetchedAt: document.fetchedAt,
    stale
  };
}

function apiErrorMessage(status: number, body: ApiErrorBody) {
  if (status === 400) return "That tag is not valid.";
  if (status === 403) return "The Clash Royale API rejected this server. Check the API token and its allowed IP address.";
  if (status === 404) return "No Clash Royale profile was found for that tag.";
  if (status === 429) return "The Clash Royale API rate limit was reached. Try again shortly.";
  if (status >= 500) return "The Clash Royale API is temporarily unavailable.";
  return body.message ?? body.reason ?? "The Clash Royale API request failed.";
}

async function fetchClash<T>(ctx: ActionCtx, endpoint: string) {
  const token = process.env.CLASH_ROYALE_API_TOKEN;
  if (!token) {
    throw new ConvexError({
      code: "MISSING_API_TOKEN",
      message: "Add CLASH_ROYALE_API_TOKEN to the Convex deployment environment."
    });
  }

  const baseUrl = (process.env.CLASH_ROYALE_API_BASE_URL ?? "https://api.clashroyale.com/v1").replace(/\/$/, "");
  let response: Response;
  try {
    response = await fetch(`${baseUrl}${endpoint}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }
    });
  } catch {
    throw new ConvexError({
      code: "CLASH_API_NETWORK",
      message: "The Clash Royale API could not be reached from the backend."
    });
  }

  await ctx.runMutation(cacheApi.logFetch, {
    endpoint,
    status: response.status,
    ok: response.ok,
    fetchedAt: Date.now()
  });

  if (!response.ok) {
    let body: ApiErrorBody = {};
    try {
      body = (await response.json()) as ApiErrorBody;
    } catch {
      body = {};
    }
    throw new ConvexError({
      code: `CLASH_API_${response.status}`,
      status: response.status,
      message: apiErrorMessage(response.status, body)
    });
  }

  return (await response.json()) as T;
}

async function saveCache(
  ctx: ActionCtx,
  key: string,
  kind: CacheKind,
  data: unknown,
  profile?: { kind: "player" | "clan"; tag: string; name: string; value: number }
) {
  const fetchedAt = Date.now();
  await ctx.runMutation(cacheApi.put, {
    key,
    kind,
    payload: JSON.stringify(data),
    fetchedAt,
    expiresAt: fetchedAt + cacheTtlMs(),
    profile
  });
  return fetchedAt;
}

export const getPlayerBundle = actionGeneric({
  args: { tag: v.string(), force: v.optional(v.boolean()) },
  handler: async (ctx, args): Promise<PlayerBundlePayload> => {
    const tag = normalizeActionTag(args.tag);
    const keys = {
      player: `player:${tag}`,
      battles: `battles:${tag}`,
      chests: `chests:${tag}`
    };
    const [playerCache, battleCache, chestCache] = (await Promise.all([
      ctx.runQuery(cacheApi.get, { key: keys.player }),
      ctx.runQuery(cacheApi.get, { key: keys.battles }),
      ctx.runQuery(cacheApi.get, { key: keys.chests })
    ])) as [CacheDocument | null, CacheDocument | null, CacheDocument | null];

    const allCached = playerCache && battleCache && chestCache;
    const allFresh = allCached && [playerCache, battleCache, chestCache].every((item) => item.expiresAt > Date.now());

    if (allFresh && !args.force) {
      return {
        player: cachedPayload<ApiPlayer>(playerCache),
        battles: cachedPayload<ApiBattle[]>(battleCache),
        chests: cachedPayload<ApiChestList>(chestCache)
      };
    }

    try {
      const encodedTag = tagPath(tag);
      const [player, battles, chests] = await Promise.all([
        fetchClash<ApiPlayer>(ctx, `/players/${encodedTag}`),
        fetchClash<ApiBattle[]>(ctx, `/players/${encodedTag}/battlelog`),
        fetchClash<ApiChestList>(ctx, `/players/${encodedTag}/upcomingchests`)
      ]);
      const [playerFetchedAt, battlesFetchedAt, chestsFetchedAt] = await Promise.all([
        saveCache(ctx, keys.player, "player", player, {
          kind: "player",
          tag,
          name: player.name,
          value: player.trophies ?? 0
        }),
        saveCache(ctx, keys.battles, "battles", battles),
        saveCache(ctx, keys.chests, "chests", chests)
      ]);

      return {
        player: { data: player, fetchedAt: playerFetchedAt, stale: false },
        battles: { data: battles, fetchedAt: battlesFetchedAt, stale: false },
        chests: { data: chests, fetchedAt: chestsFetchedAt, stale: false }
      };
    } catch (error) {
      if (allCached) {
        return {
          player: cachedPayload<ApiPlayer>(playerCache, true),
          battles: cachedPayload<ApiBattle[]>(battleCache, true),
          chests: cachedPayload<ApiChestList>(chestCache, true)
        };
      }
      throw error;
    }
  }
});

export const getClanBundle = actionGeneric({
  args: { tag: v.string(), force: v.optional(v.boolean()) },
  handler: async (ctx, args): Promise<ClanBundlePayload> => {
    const tag = normalizeActionTag(args.tag);
    const key = `clan:${tag}`;
    const cached = (await ctx.runQuery(cacheApi.get, { key })) as CacheDocument | null;

    if (cached && cached.expiresAt > Date.now() && !args.force) {
      return { clan: cachedPayload<ApiClan>(cached) };
    }

    try {
      const clan = await fetchClash<ApiClan>(ctx, `/clans/${tagPath(tag)}`);
      const fetchedAt = await saveCache(ctx, key, "clan", clan, {
        kind: "clan",
        tag,
        name: clan.name,
        value: clan.clanScore ?? 0
      });
      return { clan: { data: clan, fetchedAt, stale: false } };
    } catch (error) {
      if (cached) return { clan: cachedPayload<ApiClan>(cached, true) };
      throw error;
    }
  }
});

export const getCards = actionGeneric({
  args: { force: v.optional(v.boolean()) },
  handler: async (ctx, args): Promise<CardsPayload> => {
    const key = "cards:global";
    const cached = (await ctx.runQuery(cacheApi.get, { key })) as CacheDocument | null;

    if (cached && cached.expiresAt > Date.now() && !args.force) {
      return { cards: cachedPayload<ApiCardList>(cached) };
    }

    try {
      const cards = await fetchClash<ApiCardList>(ctx, "/cards");
      const fetchedAt = await saveCache(ctx, key, "cards", cards);
      return { cards: { data: cards, fetchedAt, stale: false } };
    } catch (error) {
      if (cached) return { cards: cachedPayload<ApiCardList>(cached, true) };
      throw error;
    }
  }
});
