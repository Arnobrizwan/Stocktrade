"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";

export default function CreatePost({ onPostCreated }: { onPostCreated: () => void }) {
    const { user } = useUser();
    const [content, setContent] = useState("");
    const [ticker, setTicker] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setIsSubmitting(true);
        try {
            await fetch("/api/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content, ticker }),
            });
            setContent("");
            setTicker("");
            onPostCreated();
        } catch (error) {
            console.error("Failed to create post", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) return null;

    return (
        <div className="glass-panel p-4 mb-6">
            <form onSubmit={handleSubmit}>
                <div className="flex gap-3 mb-3">
                    <img
                        src={user.imageUrl}
                        alt={user.fullName || "User"}
                        className="w-10 h-10 rounded-full border border-white/10"
                    />
                    <div className="flex-1">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Share your market insights..."
                            className="w-full bg-transparent border-none focus:ring-0 text-lg placeholder-gray-500 resize-none min-h-[80px]"
                        />
                        <input
                            type="text"
                            value={ticker}
                            onChange={(e) => setTicker(e.target.value.toUpperCase())}
                            placeholder="$TICKER (Optional)"
                            className="bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-gray-300 focus:outline-none focus:border-blue-500"
                        />
                    </div>
                </div>
                <div className="flex justify-end border-t border-white/5 pt-3">
                    <button
                        type="submit"
                        disabled={isSubmitting || !content.trim()}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4" />
                                Post Insight
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
