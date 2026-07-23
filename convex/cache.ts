import { internalMutationGeneric, internalQueryGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";

const cacheKind = v.union(
  v.literal("player"),
  v.literal("battles"),
  v.literal("chests"),
  v.literal("clan"),
  v.literal("cards")
);

export const get = internalQueryGeneric({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("apiCache")
      .withIndex("by_key", (query) => query.eq("key", args.key))
      .unique();
  }
});

export const put = internalMutationGeneric({
  args: {
    key: v.string(),
    kind: cacheKind,
    payload: v.string(),
    fetchedAt: v.number(),
    expiresAt: v.number(),
    profile: v.optional(
      v.object({
        kind: v.union(v.literal("player"), v.literal("clan")),
        tag: v.string(),
        name: v.string(),
        value: v.number()
      })
    )
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("apiCache")
      .withIndex("by_key", (query) => query.eq("key", args.key))
      .unique();

    const value = {
      key: args.key,
      kind: args.kind,
      payload: args.payload,
      fetchedAt: args.fetchedAt,
      expiresAt: args.expiresAt,
      sourceVersion: "clash-royale-v1"
    };

    if (existing) await ctx.db.patch(existing._id, value);
    else await ctx.db.insert("apiCache", value);

    if (args.profile) {
      await ctx.db.insert("profileHistory", {
        ...args.profile,
        recordedAt: args.fetchedAt
      });
    }
  }
});

export const logFetch = internalMutationGeneric({
  args: {
    endpoint: v.string(),
    status: v.number(),
    ok: v.boolean(),
    fetchedAt: v.number()
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("apiFetchLogs", args);
  }
});

export const history = queryGeneric({
  args: {
    kind: v.union(v.literal("player"), v.literal("clan")),
    tag: v.string()
  },
  handler: async (ctx, args) => {
    return ctx.db
      .query("profileHistory")
      .filter((query) => query.and(query.eq(query.field("kind"), args.kind), query.eq(query.field("tag"), args.tag)))
      .order("desc")
      .take(30);
  }
});
