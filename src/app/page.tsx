"use client";

import { UserButton, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import TrendingTickers from "@/components/dashboard/TrendingTickers";
import CreatePost from "@/components/posts/CreatePost";
import InsightsFeed from "@/components/dashboard/InsightsFeed";
import StockNewsFeed from "@/components/news/StockNewsFeed";
import MarketPulse from "@/components/dashboard/MarketPulse";
import SmartSignals from "@/components/dashboard/SmartSignals";
import { useState, useEffect } from "react";
import { BarChart3 } from "lucide-react";

interface Analyst {
    id: string;
    username: string;
    displayName: string | null;
    imageUrl: string | null;
    rank: string;
    accuracy: number;
    rankDisplay: string;
    _count: {
        posts: number;
    };
}

export default function Home() {
    const [selectedTicker, setSelectedTicker] = useState("NVDA");
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [analysts, setAnalysts] = useState<Analyst[]>([]);

    useEffect(() => {
        // Fetch top analysts
        fetch('/api/analysts')
            .then(res => res.json())
            .then(data => setAnalysts(data))
            .catch(err => console.error('Failed to fetch analysts:', err));
    }, []);

    const handlePostCreated = () => {
        setRefreshTrigger((prev) => prev + 1);
    };

    return (
        <main className="min-h-screen pb-20">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-xl">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
                        <div className="bg-blue-600 p-1.5 rounded-lg">
                            <BarChart3 className="w-5 h-5 text-white" />
                        </div>
                        <span>StockTrade</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <SignedOut>
                            <SignInButton mode="modal" forceRedirectUrl="/">
                                <button className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                                    Sign In
                                </button>
                            </SignInButton>
                        </SignedOut>
                        <SignedIn>
                            <UserButton />
                        </SignedIn>
                    </div>
                </div>
            </header>

            <div className="max-w-5xl mx-auto px-4 py-8">
                <TrendingTickers onTickerClick={setSelectedTicker} selectedTicker={selectedTicker} />

                {/* Smart Signals */}
                <SmartSignals ticker={selectedTicker} />

                {/* Live Stock News */}
                <div className="mb-6">
                    <StockNewsFeed />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Feed */}
                    <div className="lg:col-span-2">
                        <SignedIn>
                            <CreatePost onPostCreated={handlePostCreated} />
                        </SignedIn>

                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold">Community Insights</h2>
                            <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm focus:outline-none">
                                <option>Top Rated</option>
                                <option>Newest</option>
                                <option>Trending</option>
                            </select>
                        </div>

                        <InsightsFeed refreshTrigger={refreshTrigger} />
                    </div>

                    {/* Sidebar */}
                    <div className="hidden lg:block space-y-6">
                        <MarketPulse />

                        <div className="glass-panel p-5">
                            <h3 className="font-bold mb-4 text-gray-200">Top Analysts</h3>
                            <div className="space-y-4">
                                {analysts.length > 0 ? (
                                    analysts.map((analyst, index) => (
                                        <div key={analyst.id} className="flex items-center gap-3">
                                            {analyst.imageUrl ? (
                                                <img
                                                    src={analyst.imageUrl}
                                                    alt={analyst.displayName || analyst.username}
                                                    className="w-8 h-8 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center font-bold text-xs">
                                                    {(analyst.displayName || analyst.username).charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <div className="text-sm font-bold">
                                                    {analyst.displayName || analyst.username}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {analyst.accuracy}% Accuracy • {analyst._count.posts} posts
                                                </div>
                                            </div>
                                            <div className="text-bullish text-xs font-bold">
                                                {analyst.rankDisplay}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    // Loading skeleton
                                    [1, 2, 3].map((i) => (
                                        <div key={i} className="flex items-center gap-3 animate-pulse">
                                            <div className="w-8 h-8 rounded-full bg-white/10"></div>
                                            <div className="flex-1">
                                                <div className="h-3 bg-white/10 rounded w-24 mb-1"></div>
                                                <div className="h-2 bg-white/5 rounded w-16"></div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
