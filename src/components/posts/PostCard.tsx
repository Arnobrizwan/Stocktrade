"use client";

import { MessageSquare, ThumbsUp, ThumbsDown, Activity, ShieldAlert } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface PostCardProps {
    post: any;
}

export default function PostCard({ post }: PostCardProps) {
    const { author, insight, tags } = post;

    const getQualityColor = (score: number) => {
        if (score >= 80) return "text-green-400";
        if (score >= 50) return "text-yellow-400";
        return "text-red-400";
    };

    return (
        <div className="glass-panel p-5 mb-4 hover:bg-white/[0.07] transition-colors border border-white/5">
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <img
                        src={author.imageUrl || "/placeholder-user.jpg"}
                        alt={author.displayName}
                        className="w-10 h-10 rounded-full"
                    />
                    <div>
                        <div className="font-bold text-gray-200">{author.displayName}</div>
                        <div className="text-xs text-gray-500">@{author.username} • {formatDistanceToNow(new Date(post.createdAt))} ago</div>
                    </div>
                </div>
                {insight && (
                    <div className="flex flex-col items-end">
                        <div className={`text-sm font-bold ${getQualityColor(insight.qualityScore)} flex items-center gap-1`}>
                            <Activity className="w-4 h-4" />
                            Quality: {insight.qualityScore}/100
                        </div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider">{insight.type}</div>
                    </div>
                )}
            </div>

            <div className="mb-4 text-gray-300 leading-relaxed whitespace-pre-wrap">
                {post.content}
            </div>

            {post.ticker && (
                <div className="inline-block bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs font-bold mb-3 mr-2">
                    {post.ticker}
                </div>
            )}

            {tags && tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {tags.map((t: any) => (
                        <span key={t.tag.id} className="bg-white/5 text-gray-400 px-2 py-1 rounded-full text-xs border border-white/10">
                            #{t.tag.name}
                        </span>
                    ))}
                </div>
            )}

            {insight && insight.summary && (
                <div className="bg-white/5 p-3 rounded-lg mb-4 border-l-2 border-blue-500">
                    <div className="text-xs text-blue-400 font-bold mb-1 uppercase">AI Insight Summary</div>
                    <p className="text-sm text-gray-400 italic">{insight.summary}</p>
                </div>
            )}

            <div className="flex items-center gap-6 text-gray-500 text-sm border-t border-white/5 pt-3">
                <button className="flex items-center gap-2 hover:text-green-400 transition-colors">
                    <ThumbsUp className="w-4 h-4" />
                    <span>Bullish</span>
                </button>
                <button className="flex items-center gap-2 hover:text-red-400 transition-colors">
                    <ThumbsDown className="w-4 h-4" />
                    <span>Bearish</span>
                </button>
                <button className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                    <MessageSquare className="w-4 h-4" />
                    <span>Discuss</span>
                </button>
            </div>
        </div>
    );
}
