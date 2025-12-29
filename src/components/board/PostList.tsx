"use client";

import { useState, useEffect } from "react";
import { Link } from "@/i18n/routing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, ThumbsUp, Share2, PenSquare } from "lucide-react";

/**
 * 게시글 목록 컴포넌트입니다.
 * API에서 최신 게시글 4개를 가져와 렌더링합니다.
 */
export function PostList() {
    const [posts, setPosts] = useState<any[]>([]);

    useEffect(() => {
        fetch('/api/posts')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setPosts(data.slice(0, 4)); // Show only latest 4 posts
                }
            })
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Latest Discussions</h2>
                <Link href="/board/write">
                    <Button>
                        <PenSquare className="mr-2 h-4 w-4" /> New Post
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {posts.length === 0 ? (
                    <div className="col-span-full text-center py-10 text-muted-foreground bg-card/50 rounded-lg border border-white/10">
                        No discussions yet. Be the first to post!
                    </div>
                ) : (
                    posts.map((post) => (
                        <Link key={post.id} href={`/board/${post.id}`} className="group">
                            <Card className="h-full bg-card/50 backdrop-blur hover:bg-card/80 transition-all hover:-translate-y-1 hover:shadow-lg cursor-pointer border-white/10 overflow-hidden flex flex-col">
                                {/* Thumbnail */}
                                <div className="aspect-video w-full bg-secondary relative overflow-hidden">
                                    {post.imageUrls && post.imageUrls.length > 0 ? (
                                        <img
                                            src={post.imageUrls[0]}
                                            alt={post.title}
                                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                        />
                                    ) : post.imageUrl ? (
                                        <img
                                            src={post.imageUrl}
                                            alt={post.title}
                                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-secondary/50">
                                            <span className="text-2xl opacity-20">MZ</span>
                                        </div>
                                    )}
                                </div>
                                <CardHeader className="p-4 pb-2">
                                    <div className="flex items-start justify-between">
                                        <div className="w-full">
                                            <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                                                <span>{post.author.username}</span>
                                                <span>• {new Date(post.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <CardTitle className="text-lg line-clamp-1 group-hover:text-primary transition-colors">{post.title}</CardTitle>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 pt-0 mt-auto">
                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{post.content}</p>
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-3 border-t border-white/5">
                                        <span className="flex items-center gap-1">
                                            <ThumbsUp className="h-3 w-3" /> {post.likes || 0}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            {post.views} views
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
