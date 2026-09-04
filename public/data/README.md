# Snapshot data

These files back the **static GitHub Pages build only**. The live app serves the
same payloads from `src/app/api/*` at runtime.

They exist because Yahoo Finance — the app's market data source — refuses
non-browser clients. A plain `fetch` from Node or from a CI runner returns
`429 Too Many Requests`, and the endpoints send no CORS headers, so a static
page cannot call them from the visitor's browser either. The only reliable way
to get real numbers into a serverless static build is to capture them ahead of
time and commit them.

| File | Mirrors | Contents |
| --- | --- | --- |
| `trending.json` | `/api/trending` | Top 15 tickers by volume, real prices |
| `market-pulse.json` | `/api/market-pulse` | Index moves, VIX, fear/greed score |
| `news.json` | `/api/news` | Real Yahoo Finance headlines |
| `signals-<TICKER>.json` | `/api/signals?ticker=` | Smart Signal per trending ticker |
| `posts.json` | `/api/posts` | Community insights, from the repo's own seed set |
| `analysts.json` | `/api/analysts` | Top analysts, from the same seed set |
| `meta.json` | — | Capture timestamp shown in the UI banner |

Prices, volumes, index levels and headlines are genuine Yahoo Finance data.
Signal scores are computed by the real aggregator logic in
`src/lib/signals/aggregator.ts`. The community posts and analyst profiles come
from the seed set already in `src/app/api/seed/route.ts` — they are demo
content, not real users.

Regenerate the market portion with `node scripts/capture-snapshot.mjs`, from a
residential connection. See the notes at the top of that file.
