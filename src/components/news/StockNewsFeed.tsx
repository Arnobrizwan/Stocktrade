"use client";

import { useEffect, useState } from "react";
import { Newspaper, ExternalLink, Clock } from "lucide-react";

interface NewsItem {
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

export default function StockNewsFeed() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchNews = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/news?limit=20');
            if (!response.ok) throw new Error('Failed to fetch news');
            const data = await response.json();
            setNews(data);
            setError(null);
        } catch (err) {
            setError('Failed to load news');
            console.error('News fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
        // Auto-refresh every 5 minutes
        const interval = setInterval(fetchNews, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTimeAgo = (timestamp: number) => {
        // Validate timestamp
        if (!timestamp || isNaN(timestamp) || timestamp <= 0) {
            return 'Recently';
        }

        const now = Math.floor(Date.now() / 1000);
        const seconds = now - timestamp;

        // Handle future timestamps or negative values
        if (seconds < 0) {
            return 'Just now';
        }

        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days}d ago`;

        // Validate date before creating Date object
        const date = new Date(timestamp * 1000);
        if (isNaN(date.getTime())) {
            return 'Recently';
        }
        return date.toLocaleDateString();
    };

    const getThumbnailUrl = (thumbnail?: NewsItem['thumbnail']) => {
        if (!thumbnail?.resolutions || thumbnail.resolutions.length === 0) return null;
        // Get the largest resolution
        const sorted = [...thumbnail.resolutions].sort((a, b) => b.width - a.width);
        return sorted[0]?.url;
    };

    if (loading && news.length === 0) {
        return (
            <div className="glass-panel p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Newspaper className="w-5 h-5 text-blue-400" />
                    Live Stock News
                </h2>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                            <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-white/5 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="glass-panel p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Newspaper className="w-5 h-5 text-blue-400" />
                    Live Stock News
                </h2>
                <div className="text-red-400 text-sm">{error}</div>
            </div>
        );
    }

    return (
        <div className="glass-panel p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-blue-400" />
                Live Stock News
                <span className="ml-auto text-xs text-gray-400 font-normal">
                    Auto-refreshes every 5 min
                </span>
            </h2>

            <div className="space-y-4">
                {news.map((item) => {
                    const thumbnailUrl = getThumbnailUrl(item.thumbnail);

                    return (
                        <a
                            key={item.uuid}
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block group"
                        >
                            <div className="flex gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all border border-white/5 hover:border-white/10">
                                {thumbnailUrl && (
                                    <div className="flex-shrink-0">
                                        <img
                                            src={thumbnailUrl}
                                            alt=""
                                            className="w-20 h-20 object-cover rounded-lg"
                                        />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-sm mb-1 line-clamp-2 group-hover:text-blue-400 transition-colors">
                                        {item.title}
                                    </h3>
                                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                                        <span>{item.publisher}</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {formatTimeAgo(item.providerPublishTime)}
                                        </span>
                                    </div>
                                    {item.relatedTickers && item.relatedTickers.length > 0 && (
                                        <div className="flex gap-1 flex-wrap">
                                            {item.relatedTickers.slice(0, 3).map((ticker) => (
                                                <span
                                                    key={ticker}
                                                    className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                                >
                                                    {ticker}
                                                </span>
                                            ))}
                                            {item.relatedTickers.length > 3 && (
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-400">
                                                    +{item.relatedTickers.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-colors flex-shrink-0" />
                            </div>
                        </a>
                    );
                })}
            </div>
        </div>
    );
}
