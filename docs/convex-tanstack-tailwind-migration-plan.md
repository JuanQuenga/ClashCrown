# Clash Crown Modernization Plan

Trackable plan for migrating the current Clash Crown site into a modern Next.js App Router site backed by Convex, TanStack Query, and Tailwind.

## Current State

- App root: `clashcrown/`
- Framework: Next.js 16 with Pages Router under `src/pages`
- Styling: Tailwind plus large global CSS in `src/styles/globals.css`
- Data: mostly local fixtures in `src/lib/mock-data.ts`
- Existing routes:
  - `/`
  - `/players/[tag]`
  - `/clans/[tag]`
  - `/decks`
- Existing demo API routes:
  - `src/pages/api/demo/player.ts`
  - `src/pages/api/demo/clan.ts`
- Important constraint: the worktree is already dirty. Do not revert unrelated changes.

## Target Architecture

- Next.js 16 App Router in `src/app`
- Convex for app-owned backend state, cached Clash Royale API payloads, derived deck snapshots, and refresh actions
- TanStack Query for client query orchestration, search flows, filters, refresh states, and non-Convex fetches
- Tailwind for modern responsive styling while preserving the game/stat-tool visual identity
- Official Clash Royale API called only from server-side code
- No Clash Royale API token in browser bundles

## Recommended Scope

Use Next.js App Router plus TanStack Query. Do not migrate to TanStack Start unless the product direction explicitly changes to leaving Next.js.

## External API Notes

Official Clash Royale API base URL:

```txt
https://api.clashroyale.com/v1
```

Key endpoints to support first:

```txt
GET /players/{playerTag}
GET /players/{playerTag}/battlelog
GET /players/{playerTag}/upcomingchests
GET /clans/{clanTag}
GET /cards
```

Implementation notes:

- Tags entered as `#ABC123` must be normalized, validated, and URL-encoded as `%23ABC123`.
- Store the token in server environment only, for example `CLASH_ROYALE_API_TOKEN`.
- Clash Royale API tokens may require allowed outbound IP configuration. Verify whether Convex actions or the deployment host have a stable egress path before committing to the production integration.
- Cache API payloads in Convex with `fetchedAt`, `expiresAt`, and `sourceVersion` fields.

## Parallel Agent Strategy

Use one coordinator and five implementation agents. Agents should work in branches or isolated patches where possible. The coordinator owns sequencing and conflict resolution.

### Coordinator

Responsibilities:

- Keep this checklist updated.
- Enforce dependency order.
- Resolve route/component conflicts between agents.
- Run final build and smoke tests.
- Ensure API secrets never reach client code.

Owned files:

- `docs/convex-tanstack-tailwind-migration-plan.md`
- final integration changes across touched areas

Acceptance checks:

- [ ] Each phase has a passing build before the next phase starts.
- [ ] Every agent reports touched files and verification commands.
- [ ] No unrelated dirty worktree files are reverted.

### Agent A: App Router Migration

Goal: Move the current Pages Router UI into App Router with minimum behavior change.

Owned files:

- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/players/[tag]/page.tsx`
- `src/app/clans/[tag]/page.tsx`
- `src/app/decks/page.tsx`
- `src/app/providers.tsx`
- `src/pages/_app.tsx` only when safe to remove after migration

Tasks:

- [ ] Create root App Router layout.
- [ ] Move homepage into `src/app/page.tsx`.
- [ ] Move player page into `src/app/players/[tag]/page.tsx`.
- [ ] Move clan page into `src/app/clans/[tag]/page.tsx`.
- [ ] Move decks page into `src/app/decks/page.tsx`.
- [ ] Replace `next/head` with `metadata` or `generateMetadata`.
- [ ] Add a client providers component for TanStack Query and later Convex.
- [ ] Keep existing portfolio components working without broad redesign.
- [ ] Remove or quarantine duplicate Pages Router routes only after App Router routes are verified.

Acceptance checks:

- [ ] `npm run build` succeeds.
- [ ] `/`, `/players/CCDEMO`, `/clans/CCDEMO`, and `/decks` render.
- [ ] Metadata titles are preserved or improved.
- [ ] No route relies on `next/router`.

### Agent B: Convex Backend Foundation

Goal: Add Convex schema and server functions for cached Clash Royale data.

Owned files:

- `convex/schema.ts`
- `convex/players.ts`
- `convex/clans.ts`
- `convex/cards.ts`
- `convex/decks.ts`
- `convex/clashApi.ts`
- generated Convex files
- environment examples/docs

Tasks:

- [ ] Install Convex dependencies.
- [ ] Initialize Convex for the repo.
- [ ] Define schema tables:
  - [ ] `players`
  - [ ] `playerBattleLogs`
  - [ ] `playerUpcomingChests`
  - [ ] `clans`
  - [ ] `cards`
  - [ ] `deckSnapshots`
  - [ ] `apiFetchLogs`
- [ ] Add indexes for `tag`, `expiresAt`, and common lookup fields.
- [ ] Add read queries for cached player, clan, cards, chests, battle logs, and deck snapshots.
- [ ] Add actions for fetching Clash Royale API data server-side.
- [ ] Add mutations for upserting normalized payloads.
- [ ] Add stale-cache logic so reads can return cached data while refresh actions run separately.

Acceptance checks:

- [ ] `npx convex dev` starts locally.
- [ ] Schema validates.
- [ ] A fake/test payload can be inserted and read.
- [ ] No API token appears in client-side files.

### Agent C: Clash Royale API Client And Mapping

Goal: Build the typed adapter layer between Clash Royale API responses and the UI domain model.

Owned files:

- `src/lib/clash/tag.ts`
- `src/lib/clash/client.ts`
- `src/lib/clash/mappers.ts`
- `src/lib/clash/types.ts`
- related tests

Tasks:

- [ ] Add tag normalization:
  - [ ] accepts `ABC123` and `#ABC123`
  - [ ] uppercases tags
  - [ ] strips whitespace
  - [ ] validates allowed Clash tag characters
  - [ ] encodes `#` for API URLs
- [ ] Add typed fetch helper for Clash Royale API.
- [ ] Map API player payloads to the current `Player` UI shape where possible.
- [ ] Map API clan payloads to the current `Clan` UI shape where possible.
- [ ] Map battle log entries to battle cards, opponent, crowns, mode, and trophy delta where available.
- [ ] Map upcoming chests to local chest image slugs with a fallback image.
- [ ] Map card API data to local card images using stable slug rules.
- [ ] Add explicit handling for 400, 403, 404, 429, and 5xx responses.

Acceptance checks:

- [ ] Unit tests cover tag normalization.
- [ ] Unit tests cover mapper fallback behavior.
- [ ] API client throws typed errors that UI can display.
- [ ] Mappers tolerate missing optional fields.

### Agent D: Client Data Integration

Goal: Replace mock-backed screens with Convex/TanStack data flows while preserving the current UI.

Owned files:

- `src/app/providers.tsx`
- `src/hooks/usePlayerProfile.ts`
- `src/hooks/useClanProfile.ts`
- `src/hooks/useCards.ts`
- `src/hooks/useDecks.ts`
- route page client wrappers as needed
- search component files

Tasks:

- [ ] Wire Convex provider into the App Router provider tree.
- [ ] Wire TanStack Query provider with sane defaults.
- [ ] Replace `getPlayer()` fixture usage with player tag query flow.
- [ ] Replace `getClan()` fixture usage with clan tag query flow.
- [ ] Add refresh behavior for stale profiles.
- [ ] Update search to route to `/players/[tag]` or `/clans/[tag]`.
- [ ] Add loading, not-found, error, and stale-data states.
- [ ] Keep mock data only as an explicit local demo fallback, not as normal production data.

Acceptance checks:

- [ ] Searching a player tag navigates to the correct route.
- [ ] Searching a clan tag navigates to the correct route.
- [ ] Invalid tags show a useful inline error.
- [ ] Missing API token shows a server/configuration error, not a broken page.
- [ ] Existing demo pages still render without visual collapse.

### Agent E: Tailwind And UI Modernization

Goal: Modernize the UI structure without changing data contracts or blocking backend work.

Owned files:

- `src/styles/globals.css`
- component-level class updates
- optional new reusable UI components under `src/components/ui`

Tasks:

- [ ] Audit global CSS and identify styles that can remain global versus component-level.
- [ ] Preserve current Clash Royale asset-heavy identity.
- [ ] Improve responsive layout for:
  - [ ] homepage hero
  - [ ] search box
  - [ ] profile hero
  - [ ] stat cards
  - [ ] deck grids
  - [ ] clan member table
- [ ] Add robust empty/error/loading states.
- [ ] Ensure cards, tables, and buttons have stable dimensions.
- [ ] Avoid marketing-style redesign; this should stay a functional game stats tool.

Acceptance checks:

- [ ] Desktop viewport has no obvious overlaps.
- [ ] Mobile viewport has no text overflow in buttons/cards.
- [ ] Deck and card grids remain stable during loading.
- [ ] Lighthouse/accessibility obvious issues are addressed where practical.

### Agent F: Verification And Tooling

Goal: Add enough testing and verification for confidence during migration.

Owned files:

- test config files
- `src/**/*.test.ts`
- smoke test scripts if added
- docs updates for local setup

Tasks:

- [ ] Add a lightweight test runner if none exists.
- [ ] Test tag normalization.
- [ ] Test Clash API mapper functions.
- [ ] Test route helper behavior for search.
- [ ] Add a basic smoke checklist or Playwright setup if practical.
- [ ] Document required environment variables.

Acceptance checks:

- [ ] `npm run build` succeeds.
- [ ] Test command succeeds.
- [ ] Smoke route checklist is documented.
- [ ] Local setup docs include Convex and Clash Royale API token steps.

## Phase Plan

### Phase 0: Baseline

- [ ] Record current package manager and Node version.
- [ ] Run `npm install` if dependencies are missing.
- [ ] Run `npm run build` and record baseline errors.
- [ ] Confirm which files are unrelated dirty worktree changes.

Exit criteria:

- [ ] Baseline status is documented in this file or a linked note.

### Phase 1: App Router Without Live Data

Agents:

- Agent A primary
- Agent E assists only if CSS breaks during route migration

Tasks:

- [ ] Add App Router files.
- [ ] Preserve mock data rendering.
- [ ] Preserve current routes.
- [ ] Verify build.

Exit criteria:

- [ ] App Router renders all existing main pages with mock data.

### Phase 2: Convex Foundation

Agents:

- Agent B primary
- Agent F adds minimal backend verification

Tasks:

- [ ] Install and initialize Convex.
- [ ] Add schema and cached read/write functions.
- [ ] Add provider placeholder to app.

Exit criteria:

- [ ] Convex dev environment runs.
- [ ] App still builds.

### Phase 3: API Adapter

Agents:

- Agent C primary
- Agent F tests adapter logic

Tasks:

- [ ] Add Clash API client.
- [ ] Add tag normalization.
- [ ] Add typed mappers.
- [ ] Add error model.

Exit criteria:

- [ ] Adapter tests pass.
- [ ] A server-side call can fetch one known player or reports a typed configuration/IP/token error.

### Phase 4: Live Player Flow

Agents:

- Agent D primary
- Agent B supports Convex refresh actions
- Agent E handles loading/error UI

Tasks:

- [ ] Wire `/players/[tag]` to Convex/TanStack data.
- [ ] Fetch player profile, battle log, and upcoming chests.
- [ ] Cache payloads in Convex.
- [ ] Search navigates to real player route.

Exit criteria:

- [ ] A real player tag renders with live or cached data.
- [ ] Invalid player tags render a controlled error state.

### Phase 5: Live Clan Flow

Agents:

- Agent D primary
- Agent B supports clan functions
- Agent E handles table responsiveness

Tasks:

- [ ] Wire `/clans/[tag]` to Convex/TanStack data.
- [ ] Fetch clan profile and members.
- [ ] Cache payloads in Convex.
- [ ] Search supports clan route.

Exit criteria:

- [ ] A real clan tag renders with live or cached data.
- [ ] Clan member table works on mobile and desktop.

### Phase 6: Decks And Derived Data

Agents:

- Agent B primary for derived data
- Agent D primary for UI data hooks
- Agent E supports deck page layout

Tasks:

- [ ] Derive deck snapshots from cached battle logs.
- [ ] Add deck list query with filters.
- [ ] Replace static decks page data.
- [ ] Keep copy deck behavior or mark it as intentionally disabled until deep-link format is implemented.

Exit criteria:

- [ ] Deck page shows derived or cached deck data.
- [ ] Empty deck state is handled.

### Phase 7: Final Verification

Agents:

- Coordinator primary
- Agent F primary for tests

Tasks:

- [ ] Run build.
- [ ] Run tests.
- [ ] Test desktop viewport.
- [ ] Test mobile viewport.
- [ ] Verify no secret tokens are exposed client-side.
- [ ] Update README with setup commands and environment variables.

Exit criteria:

- [ ] Site can be run locally by a new developer.
- [ ] Main functional routes work with live or cached data.
- [ ] Known limitations are documented.

## Environment Variables

Required:

```txt
CLASH_ROYALE_API_TOKEN=
NEXT_PUBLIC_CONVEX_URL=
CONVEX_DEPLOYMENT=
```

Optional:

```txt
CLASH_ROYALE_API_BASE_URL=https://api.clashroyale.com/v1
CLASH_ROYALE_CACHE_TTL_SECONDS=900
```

Rules:

- `CLASH_ROYALE_API_TOKEN` must not use the `NEXT_PUBLIC_` prefix.
- Client code may only read `NEXT_PUBLIC_CONVEX_URL`.
- Server-side Convex actions should read Clash API secrets from Convex environment variables where possible.

## Data Model Draft

Draft Convex schema concepts:

```ts
players: {
  tag: string;
  normalizedTag: string;
  name: string;
  payload: unknown;
  fetchedAt: number;
  expiresAt: number;
}

playerBattleLogs: {
  playerTag: string;
  battles: unknown[];
  fetchedAt: number;
  expiresAt: number;
}

playerUpcomingChests: {
  playerTag: string;
  chests: unknown[];
  fetchedAt: number;
  expiresAt: number;
}

clans: {
  tag: string;
  normalizedTag: string;
  name: string;
  payload: unknown;
  fetchedAt: number;
  expiresAt: number;
}

cards: {
  key: string;
  name: string;
  elixirCost?: number;
  rarity?: string;
  payload: unknown;
  fetchedAt: number;
  expiresAt: number;
}

deckSnapshots: {
  key: string;
  source: "battlelog" | "manual" | "seed";
  cards: string[];
  battleType?: string;
  wins: number;
  losses: number;
  games: number;
  crownsFor: number;
  crownsAgainst: number;
  updatedAt: number;
}

apiFetchLogs: {
  endpoint: string;
  status: number;
  ok: boolean;
  message?: string;
  createdAt: number;
}
```

Use stricter Convex validators in implementation. This section is a planning draft, not final schema code.

## Definition Of Done

- [ ] App uses Next.js App Router for all primary routes.
- [ ] Convex is the app backend/cache layer.
- [ ] TanStack Query is used for client query orchestration.
- [ ] Main pages no longer depend on `src/lib/mock-data.ts` for normal operation.
- [ ] Official Clash Royale API calls are server-side only.
- [ ] Player search works.
- [ ] Clan search works.
- [ ] Player pages show profile, battles, and chests.
- [ ] Clan pages show profile and members.
- [ ] Decks page uses derived or cached real data.
- [ ] Tailwind UI is responsive and does not visibly break on mobile.
- [ ] Build and tests pass.
- [ ] README documents setup and known API limitations.

## Known Risks

- Clash Royale API token IP allowlisting may not work cleanly from Convex or serverless hosts without stable egress.
- API data may not contain every metric currently shown by mocks, so some UI stats need fallback, hiding, or derived calculations.
- Existing worktree contains many staged/deleted/modified files. Agents must avoid destructive git operations.
- Image filename coverage may be incomplete for current live card/chest names.
- Next.js 16 App Router migration can expose client/server component boundaries in existing components that use hooks.

## Useful References

- Convex Next.js App Router docs: https://docs.convex.dev/client/nextjs/app-router/
- Convex with TanStack Query: https://docs.convex.dev/client/tanstack/tanstack-query/
- Convex Next.js server rendering: https://docs.convex.dev/client/nextjs/app-router/server-rendering
- TanStack Query advanced SSR: https://tanstack.com/query/v5/docs/framework/react/guides/advanced-ssr
- Clash Royale developer portal: https://developer.clashroyale.com/
