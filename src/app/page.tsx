"use client";

import { UserButton, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import TrendingTickers from "@/components/dashboard/TrendingTickers";
import CreatePost from "@/components/posts/CreatePost";
import InsightsFeed from "@/components/dashboard/InsightsFeed";
import { useState } from "react";
import { BarChart3 } from "lucide-react";

export default function Home() {
    const [refreshTrigger, setRefreshTrigger] = useState(0);

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
                            <SignInButton mode="modal">
                                <button className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                                    Sign In
                                </button>
                            </SignInButton>
                        </SignedOut>
                        <SignedIn>
                            <UserButton afterSignOutUrl="/" />
                        </SignedIn>
                    </div>
                </div>
            </header>

            <div className="max-w-5xl mx-auto px-4 py-8">
                <TrendingTickers />

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
                        <div className="glass-panel p-5">
                            <h3 className="font-bold mb-4 text-gray-200">Market Pulse</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Fear & Greed</span>
                                    <span className="text-bullish font-bold">65 (Greed)</span>
                                </div>
                                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                                    <div className="bg-bullish h-full w-[65%]"></div>
                                </div>

                                <div className="pt-4 border-t border-white/5">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-400">Sector Rotation</span>
                                    </div>
                                    <div className="flex gap-2 flex-wrap">
                                        <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded">Tech</span>
                                        <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded">Energy</span>
                                        <span className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded">Utilities</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="glass-panel p-5">
                            <h3 className="font-bold mb-4 text-gray-200">Top Analysts</h3>
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center font-bold text-xs">
                                            U{i}
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm font-bold">Analyst_{i}</div>
                                            <div className="text-xs text-gray-500">92% Accuracy</div>
                                        </div>
                                        <div className="text-bullish text-xs font-bold">#1</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
