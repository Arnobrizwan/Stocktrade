"use client";

import { useState, useEffect } from "react";
import { Activity, TrendingUp, TrendingDown } from "lucide-react";

interface MarketPulseData {
    score: number;
    mood: string;
    summary: string;
    indices: {
        spy: number;
        qqq: number;
        dia: number;
        vix: number;
    };
}

export default function MarketPulse() {
    const [data, setData] = useState<MarketPulseData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/market-pulse');
                const json = await res.json();
                setData(json);
            } catch (error) {
                console.error("Failed to fetch market pulse:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        // Refresh every 5 minutes
        const interval = setInterval(fetchData, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="glass-panel p-5 animate-pulse">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-5 h-5 bg-white/10 rounded-full"></div>
                    <div className="h-4 bg-white/10 rounded w-24"></div>
                </div>
                <div className="space-y-4">
                    <div className="h-2 bg-white/5 rounded w-full"></div>
                    <div className="h-16 bg-white/5 rounded w-full"></div>
                    <div className="grid grid-cols-3 gap-2">
                        <div className="h-8 bg-white/5 rounded"></div>
                        <div className="h-8 bg-white/5 rounded"></div>
                        <div className="h-8 bg-white/5 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!data) return null;

    const getMoodColor = (score: number) => {
        if (score >= 75) return "text-green-400";
        if (score >= 55) return "text-green-300";
        if (score <= 25) return "text-red-500";
        if (score <= 45) return "text-red-400";
        return "text-yellow-400";
    };

    const getMoodBg = (score: number) => {
        if (score >= 75) return "bg-green-500";
        if (score >= 55) return "bg-green-400";
        if (score <= 25) return "bg-red-600";
        if (score <= 45) return "bg-red-500";
        return "bg-yellow-500";
    };

    return (
        <div className="glass-panel p-5">
            <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-gray-200">Market Pulse</h3>
            </div>

            <div className="space-y-5">
                {/* Fear & Greed */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-400">Fear & Greed</span>
                        <span className={`font-bold ${getMoodColor(data.score)}`}>
                            {data.score} ({data.mood})
                        </span>
                    </div>
                    <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-1000 ${getMoodBg(data.score)}`}
                            style={{ width: `${data.score}%` }}
                        ></div>
                    </div>
                </div>

                {/* AI Summary */}
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <p className="text-xs text-gray-300 leading-relaxed italic">
                        "{data.summary}"
                    </p>
                    <div className="mt-2 flex justify-end">
                        <span className="text-[10px] text-blue-400/70 font-mono">AI GENERATED</span>
                    </div>
                </div>

                {/* Indices Mini-View */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5">
                    <IndexItem name="SPY" value={data.indices.spy} />
                    <IndexItem name="QQQ" value={data.indices.qqq} />
                    <IndexItem name="DIA" value={data.indices.dia} />
                </div>
            </div>
        </div>
    );
}

function IndexItem({ name, value }: { name: string, value: number }) {
    const isPositive = value >= 0;
    return (
        <div className="text-center">
            <div className="text-[10px] text-gray-500 mb-1">{name}</div>
            <div className={`text-xs font-bold flex items-center justify-center gap-0.5 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(value).toFixed(2)}%
            </div>
        </div>
    );
}
