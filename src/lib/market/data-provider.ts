import yahooFinance from '@/lib/yahoo-finance';
import axios from 'axios';

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

// Initialize YahooFinance v3 (handled in singleton)
// const yahooFinance = new YahooFinance();

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

export interface NewsItem {
    uuid: string;
    title: string;
    publisher: string;
    link: string;
    providerPublishTime: number;
    type: string;
    thumbnail?: {
        resolutions?: Array<{ url: string; width: number; height: number }>;
    };
    relatedTickers?: string[];
}

export async function getMarketData(symbol: string): Promise<MarketData | null> {
    try {
        const quote = await yahooFinance.quote(symbol);

        if (!quote) {
            console.warn(`No quote data found for ${symbol}`);
            return null;
        }

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

const FMP_API_KEY = process.env.FMP_API_KEY || '12VjW4O8IUmyRccothStbrxritf63ia3';

export async function getSocialSentiment(symbol: string, count: number = 20): Promise<SocialSentiment | null> {
    try {
        // Fetch recent news from Yahoo Finance (free, unlimited)
        const newsResult = await yahooFinance.search(symbol, { newsCount: count });
        const newsItems = newsResult.news || [];

        if (!newsItems || newsItems.length === 0) {
            return {
                symbol: symbol.toUpperCase(),
                sentiment: 'Neutral',
                messageVolume: 0
            };
        }

        // Extract headlines for sentiment analysis
        const headlines = newsItems.map((item: any) => `- ${item.title}`).join('\n');

        // Analyze sentiment with Ollama
        const llmResponse = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'llama3',
                prompt: `Analyze the overall market sentiment for ${symbol} based on these recent news headlines. Respond with ONLY one word: BULLISH, BEARISH, or NEUTRAL.\n\nHeadlines:\n${headlines}\n\nSentiment:`,
                stream: false
            })
        });

        const llmData = await llmResponse.json();
        const response = llmData.response.toUpperCase();

        let sentiment: 'Bullish' | 'Bearish' | 'Neutral' = 'Neutral';
        if (response.includes('BULLISH')) sentiment = 'Bullish';
        else if (response.includes('BEARISH')) sentiment = 'Bearish';

        return {
            symbol: symbol.toUpperCase(),
            sentiment,
            messageVolume: newsItems.length
        };
    } catch (error) {
        console.error(`Social sentiment error for ${symbol}:`, error);
        return {
            symbol: symbol.toUpperCase(),
            sentiment: 'Neutral',
            messageVolume: 0
        };
    }
}

import Parser from 'rss-parser';

const parser = new Parser();

export async function getGeneralMarketNews(limit: number = 10): Promise<NewsItem[]> {
    try {
        const feeds = [
            'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10000664', // CNBC Finance
            'http://feeds.marketwatch.com/marketwatch/topstories/', // MarketWatch
            'https://www.investing.com/rss/news.rss' // Investing.com
        ];

        const feedPromises = feeds.map(url => parser.parseURL(url).catch(e => null));
        const results = await Promise.all(feedPromises);

        const allNews: NewsItem[] = [];

        results.forEach((feed: any, index: number) => {
            if (!feed || !feed.items) return;

            let publisherName = 'Market News';
            if (feeds[index].includes('cnbc')) publisherName = 'CNBC';
            else if (feeds[index].includes('marketwatch')) publisherName = 'MarketWatch';
            else if (feeds[index].includes('investing.com')) publisherName = 'Investing.com';

            feed.items.forEach((item: any) => {
                // Skip if missing title or link
                if (!item.title || !item.link) return;

                // Try to find an image in content or enclosure
                let imageUrl = undefined;
                if (item.enclosure && item.enclosure.url) {
                    imageUrl = item.enclosure.url;
                } else if (item.content && item.content.match(/src="([^"]+)"/)) {
                    imageUrl = item.content.match(/src="([^"]+)"/)[1];
                } else if (item['media:content'] && item['media:content'].$ && item['media:content'].$.url) {
                    imageUrl = item['media:content'].$.url;
                }

                allNews.push({
                    uuid: item.guid || item.link,
                    title: item.title,
                    publisher: publisherName,
                    link: item.link,
                    providerPublishTime: item.pubDate ? new Date(item.pubDate).getTime() / 1000 : Date.now() / 1000,
                    type: 'STORY',
                    thumbnail: imageUrl ? {
                        resolutions: [{ url: imageUrl, width: 800, height: 600 }]
                    } : undefined,
                    relatedTickers: []
                });
            });
        });

        return allNews
            .sort((a, b) => b.providerPublishTime - a.providerPublishTime)
            .slice(0, limit);
    } catch (error) {
        console.error('Error fetching general market news:', error);
        return [];
    }
}

export async function getStockNews(symbols: string[], limit: number = 20): Promise<NewsItem[]> {
    try {
        const allNews: NewsItem[] = [];
        const seenUuids = new Set<string>();

        // 1. Fetch General Market News (RSS) - Fetch 15 items
        const generalNews = await getGeneralMarketNews(15);
        console.log(`[NEWS] Fetched ${generalNews.length} general news items from RSS`);

        // 2. Fetch Specific Stock News (Yahoo Finance)
        const stockNews: NewsItem[] = [];
        // Limit symbols to top 5 to avoid rate limits if list is long
        const targetSymbols = symbols.slice(0, 5);

        for (const symbol of targetSymbols) {
            try {
                const result = await yahooFinance.search(symbol, { newsCount: 3 }); // Fetch 3 per stock
                const newsItems = result.news || [];

                newsItems.forEach((item: any) => {
                    stockNews.push({
                        uuid: item.uuid,
                        title: item.title,
                        publisher: item.publisher,
                        link: item.link,
                        providerPublishTime: item.providerPublishTime,
                        type: item.type,
                        thumbnail: item.thumbnail,
                        relatedTickers: item.relatedTickers || [symbol]
                    });
                });
            } catch (err) {
                console.error(`Error fetching news for ${symbol}:`, err);
            }
        }

        // Combine and Deduplicate
        // We want to ensure we have a mix. Let's take up to 10 RSS and up to 15 Stock news
        const mixedNews = [...generalNews.slice(0, 10), ...stockNews];

        mixedNews.forEach(item => {
            if (!seenUuids.has(item.uuid)) {
                seenUuids.add(item.uuid);
                allNews.push(item);
            }
        });

        // Sort by publish time (newest first) and limit
        return allNews
            .sort((a, b) => b.providerPublishTime - a.providerPublishTime)
            .slice(0, limit);
    } catch (error) {
        console.error('Error fetching stock news:', error);
        return [];
    }
}


