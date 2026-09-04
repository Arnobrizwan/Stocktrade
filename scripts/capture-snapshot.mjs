#!/usr/bin/env node
/**
 * Rebuilds public/data/*.json — the snapshot the static GitHub Pages build reads.
 *
 * IMPORTANT: Yahoo Finance rejects non-browser clients. Running this from Node,
 * CI, or any datacenter IP returns "429 Too Many Requests" even for a single
 * request. It only succeeds from a residential connection, and in practice from
 * a real browser session. If you get 429s, open finance.yahoo.com in a browser
 * and run the same fetches from its console instead — that origin is allowed.
 *
 * Usage: node scripts/capture-snapshot.mjs
 */
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const SYMBOLS = ["NVDA","TSLA","AMD","AAPL","MSFT","GOOGL","AMZN","META","NFLX","COIN","PLTR","SOFI","RIVN","LCID","NIO","BABA","DIS","PYPL","SHOP"];
const INDICES = ["^GSPC","^IXIC","^DJI","^RUT","^VIX"];
const OUT = path.join(process.cwd(), "public", "data");

async function chart(symbol) {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${symbol}: HTTP ${res.status}`);
    const meta = (await res.json())?.chart?.result?.[0]?.meta;
    if (!meta) throw new Error(`${symbol}: no meta`);
    return {
        symbol,
        price: meta.regularMarketPrice,
        prev: meta.chartPreviousClose ?? meta.previousClose,
        high: meta.regularMarketDayHigh,
        low: meta.regularMarketDayLow,
        volume: meta.regularMarketVolume ?? 0,
    };
}

const pct = (q) => (q.prev ? ((q.price - q.prev) / q.prev) * 100 : 0);

async function main() {
    await mkdir(OUT, { recursive: true });

    const quotes = [];
    for (const s of SYMBOLS) {
        try { quotes.push(await chart(s)); } catch (e) { console.warn("skip", e.message); }
        await new Promise((r) => setTimeout(r, 150));
    }
    if (quotes.length === 0) {
        console.error("No quotes fetched. Yahoo is almost certainly blocking this host — see the note at the top of this file.");
        process.exit(1);
    }

    const trending = quotes
        .map((q) => {
            const change = pct(q);
            return {
                symbol: q.symbol,
                price: Number(q.price.toFixed(2)),
                change: Number(change.toFixed(2)),
                volume: q.volume,
                sentiment: change > 0 ? "Bullish" : change < 0 ? "Bearish" : "Neutral",
            };
        })
        .sort((a, b) => b.volume - a.volume)
        .slice(0, 15);

    const idx = {};
    for (const s of INDICES) {
        try { idx[s] = await chart(s); } catch (e) { console.warn("skip", e.message); }
        await new Promise((r) => setTimeout(r, 150));
    }
    const spy = idx["^GSPC"] ? pct(idx["^GSPC"]) : 0;
    const qqq = idx["^IXIC"] ? pct(idx["^IXIC"]) : 0;
    const dia = idx["^DJI"] ? pct(idx["^DJI"]) : 0;
    const vix = idx["^VIX"]?.price ?? 15;
    const avg = (spy + qqq + dia) / 3;

    let mood = "Neutral";
    if (avg > 0.5) mood = "Greed";
    if (avg > 1.0) mood = "Extreme Greed";
    if (avg < -0.5) mood = "Fear";
    if (avg < -1.0) mood = "Extreme Fear";

    let score = 50 + avg * 20;
    if (vix > 20) score -= 10;
    if (vix > 30) score -= 20;
    if (vix < 15) score += 10;
    score = Math.max(0, Math.min(100, Math.round(score)));

    await writeFile(path.join(OUT, "trending.json"), JSON.stringify(trending, null, 2));
    await writeFile(path.join(OUT, "market-pulse.json"), JSON.stringify({
        score, mood,
        summary: avg > 0.5 ? "Markets are rallying led by strong buying momentum."
               : avg < -0.5 ? "Markets are under pressure with broad-based selling."
               : "Markets are trading mixed with little direction today.",
        indices: { spy: Number(spy.toFixed(2)), qqq: Number(qqq.toFixed(2)), dia: Number(dia.toFixed(2)), vix },
    }, null, 2));
    await writeFile(path.join(OUT, "meta.json"), JSON.stringify({
        capturedAt: new Date().toISOString(), source: "Yahoo Finance", symbols: trending.length,
    }, null, 2));

    console.log(`Wrote ${trending.length} tickers to public/data.`);
    console.log("Note: news.json, posts.json, analysts.json and signals-*.json are not regenerated here.");
}

main().catch((e) => { console.error(e); process.exit(1); });
