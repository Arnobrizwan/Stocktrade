import { NextResponse } from 'next/server';
import { getStockNews } from '@/lib/market/data-provider';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const symbolsParam = searchParams.get('symbols');
        const limitParam = searchParams.get('limit');

        // Default to trending stocks if no symbols provided
        const symbols = symbolsParam
            ? symbolsParam.split(',').map(s => s.trim())
            : ['NVDA', 'TSLA', 'AMD', 'AAPL', 'MSFT'];

        const limit = limitParam ? parseInt(limitParam, 10) : 50;

        const news = await getStockNews(symbols, limit);

        return NextResponse.json(news);
    } catch (error) {
        console.error('News API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch news' },
            { status: 500 }
        );
    }
}
