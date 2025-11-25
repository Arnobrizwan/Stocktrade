"use client";

import { useState, useEffect } from "react";
import { Brain, TrendingUp, TrendingDown, AlertCircle, ShieldCheck, Search } from "lucide-react";

interface SignalData {
    ticker: string;
    sentimentScore: number;
    signalStrength: string;
    expertConsensus: string;
    strategy: string;
    reasoning: string;
    breakdown: {
        communitySentiment: number;
        expertSentiment: number;
        volatility: number;
    };
}

export default function SmartSignals({ ticker = "NVDA" }: { ticker?: string }) {
    const [currentTicker, setCurrentTicker] = useState(ticker);
    const [searchInput, setSearchInput] = useState(ticker);
    const [data, setData] = useState<SignalData | null>(null);
    const [loading, setLoading] = useState(true);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchInput.trim()) {
            setCurrentTicker(searchInput.toUpperCase());
        }
    };

    useEffect(() => {
        // Update currentTicker and searchInput when ticker prop changes
        setCurrentTicker(ticker);
        setSearchInput(ticker);
    }, [ticker]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/signals?ticker=${currentTicker}`);
                const json = await res.json();
                setData(json);
            } catch (error) {
                console.error("Failed to fetch signals:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentTicker]);

    return (
        <div className="glass-panel p-5 relative overflow-hidden mb-6 transition-all duration-500">
            {/* Background Glow */}
            {data && (
                <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${data.sentimentScore > 0 ? 'from-green-500/10' : 'from-red-500/10'} to-transparent blur-3xl -z-10 transition-colors duration-1000`}></div>
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-2">
                    <div className="bg-purple-500/20 p-2 rounded-lg">
                        <Brain className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-200">Smart Signals</h3>
                        <div className="text-xs text-gray-500">AI-Powered Strategy for {currentTicker}</div>
                    </div>
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="flex items-center gap-2">
                    <div className="relative">
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="bg-black/30 border border-white/10 rounded-lg py-1.5 pl-3 pr-8 text-sm text-white focus:outline-none focus:border-purple-500/50 w-24 uppercase font-bold placeholder-gray-600"
                            placeholder="Ticker"
                        />
                        <Search className="w-3 h-3 text-gray-500 absolute right-2.5 top-2.5" />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                    >
                        {loading ? '...' : 'Analyze'}
                    </button>
                </form>
            </div>

            {loading ? (
                <div className="animate-pulse space-y-4">
                    <div className="h-24 bg-white/5 rounded-xl"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="h-12 bg-white/5 rounded-xl"></div>
                        <div className="h-12 bg-white/5 rounded-xl"></div>
                    </div>
                </div>
            ) : !data ? (
                <div className="text-center py-10 text-gray-500 bg-white/5 rounded-xl border border-white/5">
                    No data available for ${currentTicker}
                </div>
            ) : (
                <>
                    <div className="flex justify-end mb-4">
                        <div className={`px-3 py-1 rounded-full text-xs font-bold border ${data.sentimentScore > 0 ? 'border-green-500/30 bg-green-500/10 text-green-400' : 'border-red-500/30 bg-red-500/10 text-red-400'}`}>
                            {data.signalStrength.toUpperCase()}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Strategy Card */}
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex flex-col justify-center">
                            <div className="text-xs text-purple-400 font-bold mb-2 flex items-center gap-1">
                                <Brain className="w-3 h-3" />
                                RECOMMENDED STRATEGY
                            </div>
                            <h4 className="font-bold text-lg mb-2 text-gray-100">{data.strategy}</h4>
                            <p className="text-sm text-gray-400 leading-relaxed">
                                {data.reasoning}
                            </p>
                        </div>

                        {/* Metrics */}
                        <div className="space-y-4">
                            {/* Sentiment Meter */}
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-gray-400">Weighted Sentiment</span>
                                    <span className={data.sentimentScore > 0 ? "text-green-400" : "text-red-400"}>{data.sentimentScore}</span>
                                </div>
                                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden flex relative">
                                    {/* Center Marker */}
                                    <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/20 z-10"></div>

                                    <div className="w-1/2 flex justify-end">
                                        <div className={`h-full bg-red-500 transition-all duration-1000 rounded-l-full`} style={{ width: `${Math.abs(Math.min(0, data.sentimentScore))}%` }}></div>
                                    </div>
                                    <div className="w-1/2 flex justify-start">
                                        <div className={`h-full bg-green-500 transition-all duration-1000 rounded-r-full`} style={{ width: `${Math.max(0, data.sentimentScore)}%` }}></div>
                                    </div>
                                </div>
                            </div>

                            {/* Expert Consensus */}
                            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-blue-400" />
                                    <span className="text-sm text-gray-300">Expert Consensus</span>
                                </div>
                                <span className={`text-sm font-bold ${data.expertConsensus === 'Bullish' ? 'text-green-400' : data.expertConsensus === 'Bearish' ? 'text-red-400' : 'text-gray-400'}`}>
                                    {data.expertConsensus}
                                </span>
                            </div>

                            {/* Volatility */}
                            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 text-orange-400" />
                                    <span className="text-sm text-gray-300">Volatility (24h)</span>
                                </div>
                                <span className="text-sm font-bold text-gray-300">
                                    {data.breakdown.volatility.toFixed(2)}%
                                </span>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
