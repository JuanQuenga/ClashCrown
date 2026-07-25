import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const cacheKind = v.union(
  v.literal("player"),
  v.literal("battles"),
  v.literal("chests"),
  v.literal("clan"),
  v.literal("cards"),
  v.literal("war"),
  v.literal("locations"),
  v.literal("rankings"),
  v.literal("leaderboards"),
  v.literal("leaderboard"),
  v.literal("clanSearch"),
  v.literal("tournaments")
);

export default defineSchema({
  apiCache: defineTable({
    key: v.string(),
    kind: cacheKind,
    payload: v.string(),
    fetchedAt: v.number(),
    expiresAt: v.number(),
    sourceVersion: v.string()
  })
    .index("by_key", ["key"])
    .index("by_expires_at", ["expiresAt"]),

  profileHistory: defineTable({
    kind: v.union(v.literal("player"), v.literal("clan")),
    tag: v.string(),
    name: v.string(),
    value: v.number(),
    recordedAt: v.number()
  }).index("by_profile", ["kind", "tag", "recordedAt"]),

  apiFetchLogs: defineTable({
    endpoint: v.string(),
    status: v.number(),
    ok: v.boolean(),
    fetchedAt: v.number()
  }).index("by_fetched_at", ["fetchedAt"])
});
