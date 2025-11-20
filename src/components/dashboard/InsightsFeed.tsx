"use client";

import { useEffect, useState } from "react";
import PostCard from "@/components/posts/PostCard";
import { Loader2 } from "lucide-react";

export default function InsightsFeed({ refreshTrigger }: { refreshTrigger: number }) {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPosts = async () => {
        try {
            const res = await fetch("/api/posts");
            const data = await res.json();
            setPosts(data);
        } catch (error) {
            console.error("Failed to fetch posts", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [refreshTrigger]);

    if (loading) {
        return (
            <div className="flex justify-center py-10">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div>
            {posts.map((post) => (
                <PostCard key={post.id} post={post} />
            ))}
            {posts.length === 0 && (
                <div className="text-center text-gray-500 py-10">
                    No insights yet. Be the first to share!
                </div>
            )}
        </div>
    );
}
