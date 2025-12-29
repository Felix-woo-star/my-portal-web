"use client";

import { useState, useEffect } from "react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, PenSquare, TrendingUp, Crown } from "lucide-react";
import { useTranslations } from "next-intl";

/**
 * 커뮤니티 게시판 페이지 컴포넌트입니다.
 * 게시글 목록과 사이드바(인기 태그, 프리미엄 배너)를 렌더링합니다.
 */
export default function BoardPage() {
    const t = useTranslations('BoardPage');
    const [posts, setPosts] = useState<any[]>([]);

    useEffect(() => {
        fetch('/api/posts')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    console.log("Fetched posts:", data);
                    setPosts(data);
                } else {
                    console.error("Failed to fetch posts:", data);
                    setPosts([]);
                }
            })
            .catch(err => {
                console.error(err);
                setPosts([]);
            });
    }, []);

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Main Content */}
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-3xl font-bold">{t('title')}</h1>
                        <Link href="/board/write">
                            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                                <PenSquare className="mr-2 h-4 w-4" /> {t('newPost')}
                            </Button>
                        </Link>
                    </div>

                    {/* Search Bar */}
                    <div className="relative mb-8">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                            placeholder={t('searchPlaceholder')}
                            className="pl-10 bg-secondary/50 border-white/10 focus:border-primary transition-colors"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {posts.length === 0 ? (
                            <div className="col-span-full text-center py-10 text-muted-foreground">
                                {t('noPosts')}
                            </div>
                        ) : (
                            posts.map((post: any) => (
                                <Link key={post.id} href={`/board/${post.id}`} className="group">
                                    <div className="h-full rounded-xl bg-card border border-white/10 overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg hover:-translate-y-1 flex flex-col">
                                        {/* Thumbnail Image */}
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
                                                    <span className="text-4xl opacity-20">MZ</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="p-5 flex flex-col flex-1">
                                            <h3 className="text-lg font-bold mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                                                {post.title}
                                            </h3>
                                            <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                                                {post.content}
                                            </p>

                                            <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto pt-4 border-t border-white/5">
                                                <span className="font-medium text-foreground/80">{post.author.username}</span>
                                                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <aside className="w-full md:w-80 space-y-6">
                    {/* Popular Tags */}
                    <div className="p-6 rounded-xl bg-card border border-white/10">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <TrendingUp className="text-primary h-5 w-5" /> {t('popularTags')}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {["#KPOP", "#Fashion", "#Tech", "#Memes", "#Gaming", "#Food"].map((tag) => (
                                <span key={tag} className="px-3 py-1 rounded-full bg-secondary text-xs font-medium hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Premium Banner */}
                    <div className="p-6 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/20 relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="font-bold mb-2 flex items-center gap-2 text-primary">
                                <Crown className="h-5 w-5" /> {t('premiumTitle')}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4">{t('premiumDesc')}</p>
                            <Button variant="outline" size="sm" className="w-full border-primary/50 hover:bg-primary/10">
                                {t('upgrade')}
                            </Button>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
