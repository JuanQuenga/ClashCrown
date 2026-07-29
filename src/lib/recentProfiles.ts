/**
 * Profiles this browser has opened, newest first.
 *
 * The directory in Convex answers "who is called X"; this answers "who am I".
 * A player only has to type their tag once — after that their own name is in
 * the search box before they finish typing it, and usually before they type
 * anything at all.
 */

const STORAGE_KEY = "clash-crown:recent-profiles";
const MAX_ENTRIES = 8;

export type RecentProfile = {
  kind: "players" | "clans";
  tag: string;
  name: string;
  visitedAt: number;
};

function isRecent(value: unknown): value is RecentProfile {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Record<string, unknown>;
  return (
    (item.kind === "players" || item.kind === "clans") &&
    typeof item.tag === "string" &&
    typeof item.name === "string" &&
    typeof item.visitedAt === "number"
  );
}

export function readRecentProfiles(): RecentProfile[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isRecent) : [];
  } catch {
    // Private browsing, a quota error, or somebody else's key. Not worth a throw.
    return [];
  }
}

/** Returns the new list so a caller holding React state does not have to re-read. */
export function rememberProfile(profile: Omit<RecentProfile, "visitedAt">): RecentProfile[] {
  if (typeof window === "undefined") return [];
  const entry: RecentProfile = { ...profile, visitedAt: Date.now() };
  const next = [entry, ...readRecentProfiles().filter((item) => !(item.kind === entry.kind && item.tag === entry.tag))].slice(
    0,
    MAX_ENTRIES
  );
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Nothing to do — recents are a convenience, not state we own.
  }
  return next;
}

export function forgetProfiles() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // See above.
  }
}
