import { prisma } from '@/lib/prisma';
import axios from 'axios';
import yahooFinance from '@/lib/yahoo-finance';

interface ExpertPost {
    ticker: string;
    sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    content: string;
    insightType: string;
    summary: string;
    qualityScore: number;
    confidence: number;
}

export async function generateExpertPost(ticker: string): Promise<ExpertPost | null> {
    try {
        // 1. Fetch real-time market data
        const quote = await yahooFinance.quote(ticker);

        const price = quote.regularMarketPrice || 0;
        const change = quote.regularMarketChangePercent || 0;
        const volume = quote.regularMarketVolume || 0;
        const dayHigh = quote.regularMarketDayHigh || 0;
        const dayLow = quote.regularMarketDayLow || 0;
        const fiftyDayAvg = quote.fiftyDayAverage || 0;
        const twoHundredDayAvg = quote.twoHundredDayAverage || 0;

        // 2. Calculate technical indicators
        const volatility = dayHigh && dayLow ? ((dayHigh - dayLow) / dayLow) * 100 : 0;
        const aboveFiftyDay = price > fiftyDayAvg;
        const aboveTwoHundredDay = price > twoHundredDayAvg;

        // 3. Generate AI analysis
        const prompt = `You are a professional stock market analyst. Analyze ${ticker} and provide expert opinion.

Market Data:
- Current Price: $${price.toFixed(2)}
- Daily Change: ${change.toFixed(2)}%
- Volume: ${volume.toLocaleString()}
- Intraday Volatility: ${volatility.toFixed(2)}%
- Above 50-day MA: ${aboveFiftyDay ? 'Yes' : 'No'}
- Above 200-day MA: ${aboveTwoHundredDay ? 'Yes' : 'No'}

Provide a brief expert analysis in this EXACT format:
Sentiment: [BULLISH or BEARISH or NEUTRAL]
Content: [One sentence trading opinion, max 120 characters]
Type: [TECHNICAL or FUNDAMENTAL or MACRO]
Summary: [Brief 3-5 word summary]
Confidence: [0.60 to 0.95]

Example:
Sentiment: BULLISH
Content: Strong momentum above key moving averages. Accumulating on dips.
Type: TECHNICAL
Summary: Momentum breakout, MA support
Confidence: 0.82`;

        const response = await axios.post('http://localhost:11434/api/generate', {
            model: 'llama3',
            prompt: prompt,
            stream: false
        }, { timeout: 15000 });

        const text = response.data.response;

        // 4. Parse AI response
        const sentimentMatch = text.match(/Sentiment:\s*(BULLISH|BEARISH|NEUTRAL)/i);
        const contentMatch = text.match(/Content:\s*(.+?)(?:\n|$)/i);
        const typeMatch = text.match(/Type:\s*(TECHNICAL|FUNDAMENTAL|MACRO)/i);
        const summaryMatch = text.match(/Summary:\s*(.+?)(?:\n|$)/i);
        const confidenceMatch = text.match(/Confidence:\s*(0\.\d+)/i);

        if (!sentimentMatch || !contentMatch) {
            console.error('Failed to parse AI response for', ticker);
            return null;
        }

        const sentiment = sentimentMatch[1].toUpperCase() as 'BULLISH' | 'BEARISH' | 'NEUTRAL';
        const content = contentMatch[1].trim().substring(0, 200);
        const insightType = typeMatch ? typeMatch[1] : 'TECHNICAL';
        const summary = summaryMatch ? summaryMatch[1].trim().substring(0, 100) : 'Market analysis';
        const confidence = confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.75;

        // 5. Calculate quality score based on market conditions
        let qualityScore = 70;
        if (Math.abs(change) > 3) qualityScore += 10; // High movement = more conviction
        if (volatility > 2) qualityScore += 5; // Volatility creates opportunities
        if (aboveFiftyDay && aboveTwoHundredDay) qualityScore += 10; // Strong trend
        qualityScore = Math.min(95, qualityScore);

        return {
            ticker,
            sentiment,
            content,
            insightType,
            summary,
            qualityScore,
            confidence
        };

    } catch (error) {
        console.error(`Failed to generate expert post for ${ticker}:`, error);
        return null;
    }
}

export async function syncExpertPostsForTrending() {
    try {
        // 1. Get current trending tickers
        const trendingResponse = await fetch('http://localhost:3000/api/trending');
        const trending = await trendingResponse.json();

        if (!Array.isArray(trending) || trending.length === 0) {
            console.log('No trending data available');
            return;
        }

        // 2. Ensure expert user exists
        const expertUser = await prisma.user.upsert({
            where: { clerkId: 'ai_oracle_bot' },
            update: { reputationScore: 980 },
            create: {
                clerkId: 'ai_oracle_bot',
                username: 'AI_Oracle',
                displayName: 'AI Market Oracle',
                reputationScore: 980,
                rank: 'Oracle',
                bio: 'Real-time AI-powered market analysis',
                imageUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=AIOracle'
            }
        });

        // 3. Generate posts for top 5 trending stocks
        const topStocks = trending.slice(0, 5);
        let generated = 0;

        for (const stock of topStocks) {
            // Check if we already have a recent post (within last hour)
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            const existingPost = await prisma.post.findFirst({
                where: {
                    ticker: stock.symbol,
                    authorId: expertUser.id,
                    createdAt: { gt: oneHourAgo }
                }
            });

            if (existingPost) {
                console.log(`Recent post exists for ${stock.symbol}, skipping`);
                continue;
            }

            // Generate new expert post
            const expertPost = await generateExpertPost(stock.symbol);
            if (!expertPost) continue;

            // Save to database
            await prisma.post.create({
                data: {
                    content: expertPost.content,
                    ticker: expertPost.ticker,
                    sentiment: expertPost.sentiment,
                    authorId: expertUser.id,
                    insight: {
                        create: {
                            type: expertPost.insightType,
                            summary: expertPost.summary,
                            qualityScore: expertPost.qualityScore,
                            confidence: expertPost.confidence
                        }
                    }
                }
            });

            generated++;
            console.log(`Generated expert post for ${stock.symbol}: ${expertPost.sentiment}`);
        }

        return { success: true, generated };

    } catch (error) {
        console.error('Failed to sync expert posts:', error);
        return { success: false, error };
    }
}
