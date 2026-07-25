import { v } from "convex/values";
import type { PaginationResult } from "convex/server";
import { internalAction } from "./_generated/server";
import type { ActionCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import { clashRequest } from "./clashFetch";
import { battleObservations, META_MODES, type DeckObservation, type MetaMode } from "../src/lib/clash/battles";
import type { ApiBattle, ApiLeaderboard, ApiPaged, ApiPlayerRanking } from "../src/lib/clash/types";

/**
 * Fetching half of the battle-log pipeline. The official API exposes battles
 * only per player, so deck statistics are built by polling a rotating set of
 * player tags and folding what comes back into daily aggregates.
 *
 * Runs in the default Convex runtime — `fetch` is available there and none of
 * this needs Node built-ins.
 */

const GLOBAL_LOCATION_ID = 57000000;
/** How long a claimed target stays off the queue while its fetch is in flight. */
const LEASE_MS = 5 * 60 * 1000;
/** Battle logs hold 25 battles, so polling faster than this mostly re-reads old rows. */
const REVISIT_SECONDS = 45 * 60;
const MAX_ROLLUP_ROWS = 60_000;

function envNumber(name: string, fallback: number) {
  const parsed = Number(process.env[name]);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

async function logFetch(ctx: ActionCtx, endpoint: string, status: number, ok: boolean) {
  await ctx.runMutation(internal.cache.logFetch, { endpoint, status, ok, fetchedAt: Date.now() });
}

type RunResult = { note?: string; counters?: Record<string, number> };

/** Wraps a job so every execution shows up on the beta page, success or not. */
async function run(ctx: ActionCtx, job: string, body: () => Promise<RunResult>): Promise<RunResult> {
  const id = await ctx.runMutation(internal.meta.startRun, { job });
  try {
    const result = await body();
    await ctx.runMutation(internal.meta.finishRun, {
      id,
      ok: true,
      note: result.note,
      counters: result.counters
    });
    return result;
  } catch (error) {
    await ctx.runMutation(internal.meta.finishRun, {
      id,
      ok: false,
      note: error instanceof Error ? error.message : "Unknown failure"
    });
    throw error;
  }
}

// --- Discovery ------------------------------------------------------------

/**
 * Refills the crawl queue from the public leaderboards. Ladder rank becomes the
 * crawl priority, so the players generating the most relevant battles are the
 * ones we poll first.
 */
export const discover = internalAction({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? envNumber("CLASH_DISCOVER_LIMIT", 200), 1000);

    return run(ctx, "discover", async (): Promise<RunResult> => {
      const targets: Array<{ tag: string; source: "ladder" | "pathOfLegends"; priority: number }> = [];

      const ladder = await clashRequest<ApiPaged<ApiPlayerRanking>>(
        `/locations/${GLOBAL_LOCATION_ID}/rankings/players?limit=${limit}`
      );
      await logFetch(ctx, "/locations/global/rankings/players", ladder.status, ladder.ok);
      if (ladder.ok) {
        for (const [index, player] of (ladder.data.items ?? []).entries()) {
          if (player.tag) targets.push({ tag: player.tag.replace(/^#/, ""), source: "ladder", priority: index });
        }
      }

      // Path of Legends is a separate ladder with its own metagame, so it gets
      // its own seed set rather than being inferred from trophy rankings.
      const boards = await clashRequest<ApiPaged<ApiLeaderboard>>("/leaderboards");
      await logFetch(ctx, "/leaderboards", boards.status, boards.ok);
      const boardId = boards.ok ? boards.data.items?.[0]?.id : undefined;

      if (typeof boardId === "number") {
        const top = await clashRequest<ApiPaged<ApiPlayerRanking>>(`/leaderboard/${boardId}?limit=${limit}`);
        await logFetch(ctx, "/leaderboard/{id}", top.status, top.ok);
        if (top.ok) {
          for (const [index, player] of (top.data.items ?? []).entries()) {
            if (player.tag) targets.push({ tag: player.tag.replace(/^#/, ""), source: "pathOfLegends", priority: index });
          }
        }
      }

      if (!targets.length) {
        return { note: ladder.ok ? "Leaderboards returned no players." : ladder.message, counters: { discovered: 0 } };
      }

      const { added, seen } = await ctx.runMutation(internal.meta.upsertTargets, { targets });
      return { note: `${added} new of ${seen} seen`, counters: { discovered: seen, added } };
    });
  }
});

// --- Crawl ----------------------------------------------------------------

export const crawl = internalAction({
  args: { batch: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const batch = Math.min(args.batch ?? envNumber("CLASH_CRAWL_BATCH", 8), 50);

    return run(ctx, "crawl", async (): Promise<RunResult> => {
      const claimed = await ctx.runMutation(internal.meta.claimTargets, { limit: batch, leaseMs: LEASE_MS });
      if (!claimed.length) return { note: "No targets due.", counters: { fetched: 0, battles: 0 } };

      let battles = 0;
      let observations = 0;
      let failures = 0;

      // Sequential on purpose: the shared API token has one rate limit and a
      // burst of parallel requests is the fastest way to get 429ed.
      for (const target of claimed) {
        const response = await clashRequest<ApiBattle[]>(`/players/%23${target.tag}/battlelog`);
        await logFetch(ctx, "/players/{tag}/battlelog", response.status, response.ok);

        if (!response.ok) {
          failures += 1;
          await ctx.runMutation(internal.meta.ingestBattles, {
            targetId: target.id,
            observations: [],
            revisitSeconds: REVISIT_SECONDS,
            failed: true
          });
          continue;
        }

        const collected: DeckObservation[] = [];
        for (const battle of response.data ?? []) {
          // Anything at or before the newest battle we already stored is a
          // re-read; the log is ordered newest first but not guaranteed to be.
          const items = battleObservations(battle);
          if (items.length && target.lastBattleTime && items[0].battleTime <= target.lastBattleTime) continue;
          collected.push(...items);
        }

        const result = await ctx.runMutation(internal.meta.ingestBattles, {
          targetId: target.id,
          observations: collected,
          revisitSeconds: REVISIT_SECONDS
        });
        battles += result.battles;
        observations += result.observations;
      }

      return {
        note: `${claimed.length} tags, ${battles} new battles${failures ? `, ${failures} failed` : ""}`,
        counters: { fetched: claimed.length, battles, observations, failures }
      };
    });
  }
});

// --- Rollup ---------------------------------------------------------------

type Aggregate = {
  deckHash: string;
  cardIds: number[];
  evolutionIds: number[];
  uses: number;
  wins: number;
};

async function aggregateWindow(ctx: ActionCtx, days: number) {
  const byMode = new Map<MetaMode, Map<string, Aggregate>>();
  const totals = new Map<MetaMode, number>();
  let rowsRead = 0;
  let truncated = false;

  for (let offset = 0; offset < days; offset += 1) {
    const day = Number(
      new Date(Date.now() - offset * 86_400_000).toISOString().slice(0, 10).replace(/-/g, "")
    );
    let cursor: string | null = null;

    for (;;) {
      // Annotated to break the TypeScript circularity between this action and
      // the query it calls.
      const page: PaginationResult<Doc<"deckStats">> = await ctx.runQuery(internal.meta.deckStatsForDay, {
        day,
        cursor,
        numItems: 512
      });
      rowsRead += page.page.length;

      for (const row of page.page) {
        const mode = row.mode as MetaMode;
        const decks = byMode.get(mode) ?? new Map<string, Aggregate>();
        const entry = decks.get(row.deckHash) ?? {
          deckHash: row.deckHash,
          cardIds: row.cardIds,
          evolutionIds: row.evolutionIds,
          uses: 0,
          wins: 0
        };
        entry.uses += row.uses;
        entry.wins += row.wins;
        decks.set(row.deckHash, entry);
        byMode.set(mode, decks);
        totals.set(mode, (totals.get(mode) ?? 0) + row.uses);
      }

      if (page.isDone) break;
      cursor = page.continueCursor;
      if (rowsRead >= MAX_ROLLUP_ROWS) {
        truncated = true;
        break;
      }
    }
    if (truncated) break;
  }

  return { byMode, totals, rowsRead, truncated };
}

export const rollup = internalAction({
  args: {},
  handler: async (ctx) => {
    const topN = envNumber("CLASH_RANKING_SIZE", 100);

    return run(ctx, "rollup", async (): Promise<RunResult> => {
      let written = 0;
      let rowsRead = 0;
      const truncatedWindows: number[] = [];

      for (const windowDays of [1, 7]) {
        const { byMode, totals, rowsRead: read, truncated } = await aggregateWindow(ctx, windowDays);
        rowsRead += read;
        if (truncated) truncatedWindows.push(windowDays);

        for (const mode of META_MODES) {
          const decks = byMode.get(mode);
          const total = totals.get(mode) ?? 0;
          const rows = [...(decks?.values() ?? [])]
            // A deck seen once tells us nothing; requiring a floor keeps the
            // board from being dominated by noise on a young dataset.
            .filter((entry) => entry.uses >= envNumber("CLASH_MIN_DECK_USES", 5))
            .sort((a, b) => b.uses - a.uses)
            .slice(0, topN)
            .map((entry) => ({
              deckHash: entry.deckHash,
              cardIds: entry.cardIds,
              evolutionIds: entry.evolutionIds,
              uses: entry.uses,
              wins: entry.wins,
              winRate: entry.uses ? entry.wins / entry.uses : 0,
              usageRate: total ? entry.uses / total : 0
            }));

          const result = await ctx.runMutation(internal.meta.writeDeckRankings, { windowDays, mode, rows });
          written += result.written;
        }
      }

      const note = truncatedWindows.length
        ? `${written} rows; windows ${truncatedWindows.join(", ")}d hit the ${MAX_ROLLUP_ROWS}-row read cap and are partial`
        : `${written} ranking rows from ${rowsRead} daily aggregates`;

      return { note, counters: { written, rowsRead, truncated: truncatedWindows.length } };
    });
  }
});

// --- Retention ------------------------------------------------------------

export const prune = internalAction({
  args: {},
  handler: async (ctx) => {
    return run(ctx, "prune", async (): Promise<RunResult> => {
      let deleted = 0;
      // Bounded so a backlog cannot turn one cron tick into an endless loop;
      // the next tick picks up whatever is left.
      for (let pass = 0; pass < 40; pass += 1) {
        const result = await ctx.runMutation(internal.meta.pruneBatch, {});
        deleted += result.deleted;
        if (!result.more) break;
      }
      return { note: `${deleted} rows deleted`, counters: { deleted } };
    });
  }
});
