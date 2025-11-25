import { NextResponse } from 'next/server';
import { syncExpertPostsForTrending } from '@/lib/ai/expert-generator';

export async function POST() {
    try {
        const result = await syncExpertPostsForTrending();
        return NextResponse.json(result);
    } catch (error) {
        console.error('Expert sync failed:', error);
        return NextResponse.json({ error: 'Failed to sync expert posts' }, { status: 500 });
    }
}

// Also allow GET for manual triggering
export async function GET() {
    return POST();
}
