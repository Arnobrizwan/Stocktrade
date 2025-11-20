"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Ticker {
    symbol: string;
    price: number;
    change: number;
    sentiment: string;
}

export default function TrendingTickers() {
    const [tickers, setTickers] = useState<Ticker[]>([]);

    useEffect(() => {
        fetch("/api/trending")
            .then((res) => res.json())
            .then((data) => setTickers(data));
    }, []);

    return (
        <div className="glass-panel p-4 mb-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                Trending Assets
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {tickers.map((ticker) => (
                    <div
                        key={ticker.symbol}
                        className="min-w-[140px] p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border border-white/5"
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
                    </div>
                ))}
            </div>
        </div>
    );
}
