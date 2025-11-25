import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // 1. Create Expert Users
        const expertUser = await prisma.user.upsert({
            where: { clerkId: 'expert_bot_01' },
            update: {},
            create: {
                clerkId: 'expert_bot_01',
                username: 'MarketOracle',
                displayName: 'Market Oracle',
                reputationScore: 950,
                rank: 'Oracle',
                bio: 'AI-powered market analyst with a proven track record.',
                imageUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Oracle'
            }
        });

        const expertUser2 = await prisma.user.upsert({
            where: { clerkId: 'expert_bot_02' },
            update: {},
            create: {
                clerkId: 'expert_bot_02',
                username: 'TechAnalyst',
                displayName: 'Tech Sector Expert',
                reputationScore: 880,
                rank: 'Expert',
                bio: 'Specializing in semiconductor and EV stocks.',
                imageUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=TechExpert'
            }
        });

        // 2. Create Posts for Trending Stocks
        const stockPosts = [
            // NVDA
            { ticker: 'NVDA', sentiment: 'BULLISH', content: 'NVDA showing strong support at $140. AI chip demand remains robust. Accumulating on dips.', type: 'TECHNICAL', summary: 'Strong support, AI tailwinds', score: 92, confidence: 0.85, userId: expertUser.id },

            // TSLA
            { ticker: 'TSLA', sentiment: 'BEARISH', content: 'TSLA valuation stretched. Expecting pullback to 200 EMA before further upside.', type: 'TECHNICAL', summary: 'Overbought, MACD divergence', score: 88, confidence: 0.75, userId: expertUser.id },

            // NIO
            { ticker: 'NIO', sentiment: 'BULLISH', content: 'NIO deliveries beating expectations. Chinese EV market share growing. Long-term bullish.', type: 'FUNDAMENTAL', summary: 'Strong delivery growth, market expansion', score: 85, confidence: 0.78, userId: expertUser2.id },

            // SOFI
            { ticker: 'SOFI', sentiment: 'BULLISH', content: 'SOFI breaking out of consolidation. Fintech sector rotation underway. Target $12.', type: 'TECHNICAL', summary: 'Breakout pattern, sector strength', score: 82, confidence: 0.72, userId: expertUser2.id },

            // PLTR
            { ticker: 'PLTR', sentiment: 'NEUTRAL', content: 'PLTR at critical resistance. Waiting for confirmation above $25 before adding.', type: 'TECHNICAL', summary: 'Key resistance level, need confirmation', score: 78, confidence: 0.68, userId: expertUser.id },

            // AMD
            { ticker: 'AMD', sentiment: 'BULLISH', content: 'AMD gaining data center market share. MI300 ramp looking strong. Bullish into earnings.', type: 'FUNDAMENTAL', summary: 'Market share gains, product cycle', score: 90, confidence: 0.82, userId: expertUser2.id },

            // AAPL
            { ticker: 'AAPL', sentiment: 'NEUTRAL', content: 'AAPL consolidating near highs. iPhone cycle steady but not accelerating. Hold.', type: 'FUNDAMENTAL', summary: 'Steady demand, valuation fair', score: 75, confidence: 0.70, userId: expertUser.id },

            // GOOGL
            { ticker: 'GOOGL', sentiment: 'BULLISH', content: 'GOOGL AI initiatives gaining traction. Search dominance intact. Undervalued vs peers.', type: 'FUNDAMENTAL', summary: 'AI momentum, valuation attractive', score: 87, confidence: 0.80, userId: expertUser2.id },
        ];

        // Create all posts
        for (const post of stockPosts) {
            await prisma.post.create({
                data: {
                    content: post.content,
                    ticker: post.ticker,
                    sentiment: post.sentiment,
                    authorId: post.userId,
                    insight: {
                        create: {
                            type: post.type,
                            summary: post.summary,
                            qualityScore: post.score,
                            confidence: post.confidence
                        }
                    }
                }
            });
        }

        return NextResponse.json({
            success: true,
            message: `Seeded ${stockPosts.length} expert posts for trending stocks`
        });
    } catch (error) {
        console.error("Seeding failed:", error);
        return NextResponse.json({ error: "Seeding failed" }, { status: 500 });
    }
}
