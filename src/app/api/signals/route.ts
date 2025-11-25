import { NextRequest, NextResponse } from 'next/server';
import { getSmartSignal } from '@/lib/signals/aggregator';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const ticker = searchParams.get('ticker');

    if (!ticker) {
        return NextResponse.json({ error: 'Ticker is required' }, { status: 400 });
    }

    try {
        const signal = await getSmartSignal(ticker);
        return NextResponse.json(signal);
    } catch (error) {
        console.error('Error in signals API:', error);
        return NextResponse.json({ error: 'Failed to fetch signals' }, { status: 500 });
    }
}
