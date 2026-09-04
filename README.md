# StockTrade

AI-assisted stock social platform. Community posts get scored for insight
quality, reputation-weighted sentiment is aggregated into a per-ticker Smart
Signal, and market data and news are pulled from Yahoo Finance.

Next.js 16 (App Router) · TypeScript · Prisma/Postgres · Clerk · Tailwind ·
local LLM via Ollama.

## Live

| | URL | What it is |
| --- | --- | --- |
| App | https://stocktrade-topaz.vercel.app | Full build with API routes |
| Demo | https://arnobrizwan.github.io/Stocktrade/ | Static export, no server |

Both are public and need no login.

## Why there are two builds

Yahoo Finance is the market data source, and it refuses anything that does not
look like a browser on a residential connection:

- A `fetch` from Node or from a CI runner returns **429 Too Many Requests**,
  for a single request. This includes Vercel functions.
- The endpoints send **no CORS headers**, so a static page cannot call them
  from the visitor's browser either.

So neither deployment can show a live quote. Rather than let that surface as
placeholder numbers, both fall back to a snapshot of real Yahoo data committed
under [`public/data`](public/data), and the UI says so in a banner with the
capture timestamp. `/api/meta` reports which mode is active.

What still runs live on Vercel: the **news feed**, which comes from CNBC,
MarketWatch and Investing.com RSS rather than Yahoo, and the **signals
aggregator**, which recomputes reputation-weighted sentiment on each request.

## Running locally

```bash
npm install          # also runs prisma generate
cp .env.example .env # DATABASE_URL, Clerk keys — all optional
npm run dev
```

Everything is optional and degrades rather than crashes:

| Missing | Effect |
| --- | --- |
| `DATABASE_URL` | Posts and analysts come from the snapshot; posting is off |
| Clerk keys | Sign-in and the composer are hidden, app is read-only |
| Ollama on `:11434` | Sentiment and strategy fall back to rule-based output |

For live prices you need a residential connection. On a blocked host the app
serves the snapshot.

### Refreshing the snapshot

```bash
node scripts/capture-snapshot.mjs
```

Run it from a residential connection; see the notes at the top of that file.

## Deployment

`main` pushes deploy to both targets:

- **Vercel** builds normally.
- **GitHub Pages** runs [`.github/workflows/gh-pages.yml`](.github/workflows/gh-pages.yml),
  which strips `src/app/api`, the auth pages and middleware, then builds with
  `STATIC_EXPORT=1`. Clerk is aliased to a stub because it registers Server
  Actions, which `output: "export"` rejects.

`src/lib/api-source.ts` is the only switch: with `NEXT_PUBLIC_STATIC_MODE=1` it
rewrites `/api/x` to `/data/x.json`, so components have one code path.
