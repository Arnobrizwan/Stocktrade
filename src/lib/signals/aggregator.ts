import { prisma } from '@/lib/prisma';
import axios from 'axios';
import yahooFinance from '@/lib/yahoo-finance';

interface SignalResult {
    ticker: string;
    sentimentScore: number; // -100 to 100
    signalStrength: string; // Strong Buy, Buy, Neutral, Sell, Strong Sell
    expertConsensus: string; // Bullish, Bearish, Neutral
    strategy: string;
    reasoning: string;
    breakdown: {
        communitySentiment: number;
        expertSentiment: number;
        volatility: number;
    };
}

export async function getSmartSignal(ticker: string): Promise<SignalResult> {
    try {
        // 1. Fetch Data
        // Get posts from last 24h
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const posts = await prisma.post.findMany({
            where: {
                ticker: ticker,
                createdAt: { gt: oneDayAgo }
            },
            include: {
                author: true,
                insight: true
            }
        });

        // Get Market Data (Volatility)
        let volatility = 0;
        try {
            const quote = await yahooFinance.quote(ticker);
            // Calculate intraday volatility: (High - Low) / Low
            if (quote.regularMarketDayHigh && quote.regularMarketDayLow) {
                volatility = ((quote.regularMarketDayHigh - quote.regularMarketDayLow) / quote.regularMarketDayLow) * 100;
            } else {
                volatility = Math.abs(quote.regularMarketChangePercent || 0);
            }
        } catch (e) {
            console.error(`Failed to fetch volatility for ${ticker}`);
        }

        // 2. Calculate Weighted Sentiment
        let totalWeight = 0;
        let weightedScore = 0;

        let expertScore = 0;
        let expertCount = 0;

        posts.forEach(post => {
            if (!post.sentiment) return;

            let score = post.sentiment === 'BULLISH' ? 1 : post.sentiment === 'BEARISH' ? -1 : 0;

            // Weight by reputation (normalize 0-100 to 0-1, base 0.5)
            let weight = 0.5 + (post.author.reputationScore / 200);

            // Boost for experts
            if (post.author.rank === 'Expert' || post.author.rank === 'Oracle') {
                weight *= 2;
                expertScore += score;
                expertCount++;
            }

            // Boost by insight quality
            if (post.insight) {
                weight += (post.insight.qualityScore / 100);
            }

            weightedScore += score * weight;
            totalWeight += weight;
        });

        const finalScore = totalWeight > 0 ? (weightedScore / totalWeight) : 0; // -1 to 1
        const normalizedScore = Math.round(finalScore * 100); // -100 to 100

        // 3. Determine Signal Strength
        let signal = "Neutral";
        if (normalizedScore > 50) signal = "Strong Buy";
        else if (normalizedScore > 20) signal = "Buy";
        else if (normalizedScore < -50) signal = "Strong Sell";
        else if (normalizedScore < -20) signal = "Sell";

        const expertConsensus = expertCount > 0
            ? (expertScore > 0 ? "Bullish" : expertScore < 0 ? "Bearish" : "Neutral")
            : "No Data";

        // 4. LLM Strategy Generation
        let strategy = "Hold and Monitor";
        let reasoning = "Insufficient data to generate a strategy.";

        if (posts.length > 0) {
            try {
                const prompt = `
                You are a hedge fund trading algorithm. Generate a trading strategy for ${ticker} based on these signals:
                - Weighted Sentiment Score: ${normalizedScore} (-100 to 100)
                - Signal Strength: ${signal}
                - Expert Consensus: ${expertConsensus}
                - Recent Volatility: ${volatility.toFixed(2)}%
                - Post Volume: ${posts.length}

                Output format:
                Strategy: [Name of strategy, e.g. Momentum Long, Mean Reversion]
                Reasoning: [1 sentence explanation]
                `;

                const response = await axios.post('http://localhost:11434/api/generate', {
                    model: 'llama3',
                    prompt: prompt,
                    stream: false
                }, { timeout: 30000 });

                const text = response.data.response;
                // Parse output (simple parsing)
                const strategyMatch = text.match(/Strategy:\s*(.*)/i);
                const reasoningMatch = text.match(/Reasoning:\s*(.*)/i);

                if (strategyMatch) strategy = strategyMatch[1].trim();
                if (reasoningMatch) reasoning = reasoningMatch[1].trim();

                // Fallback if parsing fails but we have text
                if (!strategyMatch && text.length > 10) {
                    // Clean up newlines
                    reasoning = text.replace(/\n/g, ' ').substring(0, 150) + "...";
                    strategy = "AI Analysis";
                }
            } catch (e) {
                console.error("LLM generation failed");
                reasoning = "AI unavailable. Based on sentiment score.";
            }
        }

        return {
            ticker,
            sentimentScore: normalizedScore,
            signalStrength: signal,
            expertConsensus,
            strategy,
            reasoning,
            breakdown: {
                communitySentiment: normalizedScore,
                expertSentiment: expertCount > 0 ? Math.round((expertScore / expertCount) * 100) : 0,
                volatility
            }
        };

    } catch (error) {
        console.error("Error calculating smart signal:", error);
        return {
            ticker,
            sentimentScore: 0,
            signalStrength: "Neutral",
            expertConsensus: "No Data",
            strategy: "Error",
            reasoning: "Failed to calculate signals.",
            breakdown: { communitySentiment: 0, expertSentiment: 0, volatility: 0 }
        };
    }
}
