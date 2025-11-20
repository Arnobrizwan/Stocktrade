import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { analyzePost } from "@/lib/llm/processor";

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        const user = await currentUser();

        if (!userId || !user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Ensure user exists in our DB
        let dbUser = await prisma.user.findUnique({
            where: { clerkId: userId },
        });

        if (!dbUser) {
            dbUser = await prisma.user.create({
                data: {
                    clerkId: userId,
                    username: user.username || `user_${userId.substring(0, 8)}`,
                    displayName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
                    imageUrl: user.imageUrl,
                },
            });
        }

        const { content, ticker } = await req.json();

        if (!content) {
            return new NextResponse("Content is required", { status: 400 });
        }

        // 1. Create Post
        const post = await prisma.post.create({
            data: {
                content,
                ticker,
                authorId: dbUser.id,
            },
        });

        // 2. Trigger LLM Analysis (Async but awaited here for simplicity in MVP)
        const analysis = await analyzePost(content);

        // 3. Save Insight
        await prisma.insight.create({
            data: {
                postId: post.id,
                type: analysis.insightType,
                summary: analysis.summary,
                qualityScore: analysis.qualityScore,
                confidence: analysis.confidence,
                authorId: dbUser.id,
            },
        });

        // 4. Save Tags
        // First ensure tags exist, then link them
        for (const tagName of analysis.tags) {
            // Simple heuristic for category
            let category = 'TREND';
            if (['Tech', 'Finance', 'Energy'].includes(tagName)) category = 'SECTOR';
            if (['Earnings', 'Merger', 'IPO'].includes(tagName)) category = 'CATALYST';
            if (['High Risk', 'Safe Haven'].includes(tagName)) category = 'RISK';

            const tag = await prisma.tag.upsert({
                where: { name: tagName },
                update: {},
                create: {
                    name: tagName,
                    category,
                },
            });

            await prisma.postTag.create({
                data: {
                    postId: post.id,
                    tagId: tag.id,
                },
            });
        }

        // 5. Update Post Sentiment
        await prisma.post.update({
            where: { id: post.id },
            data: { sentiment: analysis.sentiment },
        });

        return NextResponse.json(post);

    } catch (error) {
        console.error("[POSTS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const posts = await prisma.post.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                author: true,
                insight: true,
                tags: {
                    include: {
                        tag: true
                    }
                },
                _count: {
                    select: { reactions: true }
                }
            },
            take: 20,
        });

        return NextResponse.json(posts);
    } catch (error) {
        console.error("[POSTS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
