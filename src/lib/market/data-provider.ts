import yahooFinance from 'yahoo-finance2';
import axios from 'axios';

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

export interface MarketData {
    symbol: string;
    price: number;
    changePercent: number;
    volume: number;
}

export interface SocialSentiment {
    symbol: string;
    sentiment: 'Bullish' | 'Bearish' | 'Neutral';
    messageVolume: number;
}

export async function getMarketData(symbol: string): Promise<MarketData | null> {
    try {
        const quote = await yahooFinance.quote(symbol) as any;
        return {
            symbol: symbol.toUpperCase(),
            price: quote.regularMarketPrice || 0,
            changePercent: quote.regularMarketChangePercent || 0,
            volume: quote.regularMarketVolume || 0,
        };
    } catch (error) {
        console.error(`Error fetching market data for ${symbol}:`, error);
        return null;
    }
}

export async function getSocialSentiment(symbol: string): Promise<SocialSentiment | null> {
    if (!RAPIDAPI_KEY) {
        console.warn("RAPIDAPI_KEY not found, skipping social sentiment");
        return null;
    }

    try {
        // Using StockTwits via RapidAPI as requested
        // Note: This is a hypothetical endpoint based on the user's request structure.
        // We'll use a generic request structure that matches the user's image context.
        const response = await axios.get(`https://stocktwits.p.rapidapi.com/streams/symbol/${symbol}.json`, {
            headers: {
                'x-rapidapi-host': 'stocktwits.p.rapidapi.com',
                'x-rapidapi-key': RAPIDAPI_KEY
            },
            params: {
                limit: 20
            }
        });

        const messages = response.data.messages || [];
        let bullishCount = 0;
        let bearishCount = 0;

        messages.forEach((msg: any) => {
            const sentiment = msg.entities?.sentiment?.basic;
            if (sentiment === 'Bullish') bullishCount++;
            if (sentiment === 'Bearish') bearishCount++;
        });

        let sentiment: 'Bullish' | 'Bearish' | 'Neutral' = 'Neutral';
        if (bullishCount > bearishCount) sentiment = 'Bullish';
        if (bearishCount > bullishCount) sentiment = 'Bearish';

        return {
            symbol: symbol.toUpperCase(),
            sentiment,
            messageVolume: messages.length
        };

    } catch (error) {
        console.error(`Error fetching social sentiment for ${symbol}:`, error);
        return null;
    }
}
