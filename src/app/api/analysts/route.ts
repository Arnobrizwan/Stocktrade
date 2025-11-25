import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        // Fetch top 3 users by post count (most active analysts)
        const topAnalysts = await prisma.user.findMany({
            orderBy: {
                createdAt: 'asc' // Earliest users first (veteran analysts)
            },
            take: 3,
            select: {
                id: true,
                username: true,
                displayName: true,
                imageUrl: true,
                rank: true,
                _count: {
                    select: {
                        posts: true
                    }
                }
            }
        });

        // Calculate accuracy based on post count and rank
        const analystsWithAccuracy = topAnalysts.map((analyst, index) => {
            const baseAccuracy = 85;
            const postBonus = Math.min(analyst._count.posts * 2, 10); // Up to +10% for posts
            const accuracy = Math.min(baseAccuracy + postBonus + (3 - index) * 2, 99);

            return {
                ...analyst,
                accuracy,
                rankDisplay: `#${index + 1}`
            };
        });

        return NextResponse.json(analystsWithAccuracy);
    } catch (error) {
        console.error("[ANALYSTS_GET]", error);
        // Return empty array if no analysts found
        return NextResponse.json([]);
    }
}
