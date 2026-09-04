import { NextResponse } from "next/server";
import { getMarketData, getSocialSentiment } from "@/lib/market/data-provider";
import yahooFinance from 'yahoo-finance2';
import { snapshot } from '@/lib/snapshot';

export async function GET() {
    try {
        // Popular stocks to check - will be sorted by volume (actual trending)
        const popularSymbols = [
            "NVDA", "TSLA", "AMD", "AAPL", "MSFT",
            "GOOGL", "AMZN", "META", "NFLX", "COIN",
            "PLTR", "SOFI", "RIVN", "LCID", "NIO",
            "BABA", "DIS", "PYPL", "SQ", "SHOP"
        ];

        console.log('[TRENDING] Fetching market data for popular stocks...');

        const results: PromiseSettledResult<any>[] = [];
        const batchSize = 5;

        // Process in batches to prevent network congestion and timeouts
        for (let i = 0; i < popularSymbols.length; i += batchSize) {
            const batch = popularSymbols.slice(i, i + batchSize);
            console.log(`[TRENDING] Processing batch ${i / batchSize + 1}/${Math.ceil(popularSymbols.length / batchSize)}`);

            const batchPromises = batch.map(async (symbol: string) => {
                try {


                    // Fetch market data first (fast)
                    const marketData = await getMarketData(symbol);
                    if (!marketData) return null;

                    // Fetch sentiment with reduced news count (5 instead of 20) for speed
                    // If sentiment fails or times out, fallback to price-based sentiment
                    let sentimentData = null;
                    try {
                        sentimentData = await Promise.race([
                            getSocialSentiment(symbol, 5), // Only analyze 5 news items
                            new Promise((resolve) => setTimeout(() => resolve(null), 8000))
                        ]) as any;
                    } catch (e) {
                        // Sentiment failed or timed out, ignore and use fallback
                        // console.log(`[TRENDING] Sentiment timeout/error for ${symbol}, using fallback`);
                    }

                    return {
                        symbol: marketData.symbol,
                        price: marketData.price,
                        change: Number(marketData.changePercent.toFixed(2)),
                        volume: marketData.volume,
                        sentiment: sentimentData?.sentiment || (marketData.changePercent > 0 ? "Bullish" : marketData.changePercent < 0 ? "Bearish" : "Neutral")
                    };
                } catch (error) {
                    console.error(`Error fetching ${symbol}:`, error);
                    return null;
                }
            });

            const batchResults = await Promise.allSettled(batchPromises);
            results.push(...batchResults);
        }

        // Filter out null results and rejected promises
        let trending = results
            .filter((result: any) => result.status === 'fulfilled' && result.value !== null)
            .map((result: any) => (result as PromiseFulfilledResult<any>).value);

        // Sort by volume (descending) to show actual trending stocks
        trending = trending
            .sort((a, b) => b.volume - a.volume)
            .slice(0, 15); // Take top 15 by volume

        console.log(`[TRENDING] Successfully fetched ${trending.length} stocks, sorted by volume`);
        console.log('[TRENDING] Top 5 by volume:', trending.slice(0, 5).map(t => `${t.symbol}: ${t.volume.toLocaleString()}`));

        if (trending.length === 0) {
            throw new Error('No trending data available');
        }

        return NextResponse.json(trending);
    } catch (error) {
        console.error("[TRENDING_GET] Error:", error);
        // Yahoo blocks datacenter IPs, so this is the normal path in production.
        // Serve the captured snapshot rather than invented prices.
        return NextResponse.json(snapshot.trending, {
            headers: { "X-Data-Source": "snapshot" },
        });
    }
}
