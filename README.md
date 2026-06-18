# Clash Crown

Archived Clash Crown portfolio demo rebuilt with modern Next.js, Tailwind CSS, TanStack Query, and synthetic Clash Royale-style data.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Demo routes

- `/` - portfolio overview
- `/players/CCDEMO` - mock player profile
- `/clans/CCDEMO` - mock clan profile
- `/decks` - mock deck library
- `/api/demo/player` - player fixture JSON
- `/api/demo/clan` - clan fixture JSON

## Notes

The original app depended on live Clash Royale API credentials and old production services. This rebuild keeps the public-facing product flow and visual assets, but all data is synthetic for resume/portfolio use.
