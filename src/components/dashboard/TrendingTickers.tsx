"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Ticker {
    symbol: string;
    price: number;
    change: number;
    sentiment: string;
}

interface TrendingTickersProps {
    onTickerClick?: (symbol: string) => void;
    selectedTicker?: string;
}

export default function TrendingTickers({ onTickerClick, selectedTicker }: TrendingTickersProps) {
    const [tickers, setTickers] = useState<Ticker[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTickers = async () => {
        try {
            const res = await fetch("/api/trending");
            const data = await res.json();
            setTickers(data);
        } catch (error) {
            console.error("Failed to fetch trending tickers:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickers();
        // Auto-refresh every 5 minutes
        const interval = setInterval(fetchTickers, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="glass-panel p-4 mb-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                Trending Assets
                <span className="ml-auto text-xs text-gray-400 font-normal">
                    Auto-refreshes every 5 min
                </span>
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {loading && tickers.length === 0 ? (
                    // Loading skeleton
                    [1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="min-w-[140px] p-3 rounded-lg bg-white/5 animate-pulse">
                            <div className="h-4 bg-white/10 rounded mb-2"></div>
                            <div className="h-3 bg-white/5 rounded mb-1"></div>
                            <div className="h-3 bg-white/5 rounded w-2/3"></div>
                        </div>
                    ))
                ) : tickers.length === 0 ? (
                    <div className="text-gray-400 text-sm">No trending assets available</div>
                ) : (
                    tickers.map((ticker) => (
                        <div
                            key={ticker.symbol}
                            onClick={() => onTickerClick?.(ticker.symbol)}
                            className={`min-w-[140px] p-3 rounded-lg transition-all cursor-pointer border ${selectedTicker === ticker.symbol
                                    ? 'bg-purple-500/20 border-purple-500/50 shadow-lg shadow-purple-500/20'
                                    : 'bg-white/5 hover:bg-white/10 border-white/5'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-bold">{ticker.symbol}</span>
                                {ticker.change > 0 ? (
                                    <TrendingUp className="w-4 h-4 text-bullish" />
                                ) : ticker.change < 0 ? (
                                    <TrendingDown className="w-4 h-4 text-bearish" />
                                ) : (
                                    <Minus className="w-4 h-4 text-gray-400" />
                                )}
                            </div>
                            <div className="text-sm font-mono">${ticker.price.toLocaleString()}</div>
                            <div
                                className={`text-xs ${ticker.change > 0 ? "text-bullish" : "text-bearish"
                                    }`}
                            >
                                {ticker.change > 0 ? "+" : ""}
                                {ticker.change}%
                            </div>
                            {ticker.sentiment && (
                                <div className="mt-2">
                                    <span
                                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${ticker.sentiment === 'Bullish'
                                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                            : ticker.sentiment === 'Bearish'
                                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                                : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                                            }`}
                                    >
                                        {ticker.sentiment}
                                    </span>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
