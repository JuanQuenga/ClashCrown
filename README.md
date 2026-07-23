# Clash Crown

Clash Crown is a full Clash Royale companion website built with Next.js, TypeScript, Tailwind CSS, TanStack Query, and Convex.

## Features

- Search any player tag and load live profile stats, battle history, current deck, card collection, and upcoming chests.
- Search any clan tag and load live clan stats, weekly donations, war trophies, and the complete member roster.
- Build an eight-card deck from the live card catalog and copy the official Clash Royale deck link.
- Cache Clash Royale API responses in Convex, record player/clan progression snapshots, and serve stale data when the upstream API is temporarily unavailable.
- Use `/players/CCDEMO` and `/clans/CCDEMO` without credentials for the built-in demo.

## Local setup

1. Install dependencies with `pnpm install`.
2. Run `pnpm convex:dev` once to create or connect a Convex deployment. This writes `NEXT_PUBLIC_CONVEX_URL` and `CONVEX_DEPLOYMENT` to `.env.local`.
3. Create a key at the [official Clash Royale developer portal](https://developer.clashroyale.com/) with `45.79.218.79` as its allowed IP address. This is the fixed egress IP documented by the [RoyaleAPI proxy](https://docs.royaleapi.com/proxy.html). Add the key and proxy URL to the Convex environment:

   ```bash
   pnpm exec convex env set CLASH_ROYALE_API_TOKEN your_token
   pnpm exec convex env set CLASH_ROYALE_API_BASE_URL https://proxy.royaleapi.dev/v1
   ```

4. Run the existing Next.js development workflow with `pnpm dev`.

Clash Royale API keys only accept individual source IPs, while Convex uses a regional egress range. The fixed-egress proxy keeps the token server-side and forwards requests to the official `/v1` API from the allowlisted IP.

## Checks

```bash
pnpm typecheck
```

## Environment

See `.env-example`. The Clash Royale token belongs in the Convex environment, never in a browser-exposed variable.

This project is not affiliated with, endorsed, sponsored, or specifically approved by Supercell.
