"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Eye, User, Share2, ThumbsUp, MessageSquare, Edit, Trash2 } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function PostDetailPage() {
    const t = useTranslations('BoardPage'); // Use BoardPage namespace
    const router = useRouter();
    const params = useParams();
    const { user } = useAuth();

    // params.id can be string or array, handle safely
    const postId = Array.isArray(params.id) ? params.id[0] : params.id;

    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (!postId) return;

        fetch(`/api/posts/${postId}`)
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch");
                return res.json();
            })
            .then(data => {
                if (data && data.title) {
                    setPost(data);
                } else {
                    setError(true);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError(true);
                setLoading(false);
            });
    }, [postId]);

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this post?")) return;
        if (!user || !user.username) return;

        setIsDeleting(true);
        try {
            const res = await fetch(`/api/posts/${postId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: user.username })
            });

            if (res.ok) {
                router.push('/board');
                router.refresh();
            } else {
                alert("Failed to delete post.");
            }
        } catch (e) {
            console.error(e);
            alert("An error occurred.");
        } finally {
            setIsDeleting(false);
        }
    };

    if (loading) {
        return <div className="text-center py-20 text-muted-foreground">Loading...</div>;
    }

    if (error || !post) {
        return (
            <div className="container mx-auto py-10 px-4 text-center">
                <h1 className="text-2xl font-bold mb-4">Post not found</h1>
                <Link href="/board">
                    <Button>{t('backToBoard')}</Button>
                </Link>
            </div>
        );
    }

    // Check ownership
    const isOwner = user?.username === post.author.username;
    const isAdmin = user?.role === 'ADMIN';
    const canEdit = isOwner || isAdmin;

    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            <Link href="/board" className="inline-flex items-center text-muted-foreground hover:text-primary mb-6 transition-colors">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('backToBoard')}
            </Link>

            <div className="bg-card border border-white/10 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md">
                {/* Header Section */}
                <div className="p-8 border-b border-white/5 bg-secondary/30">
                    <div className="flex flex-wrap gap-2 mb-4">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary border border-primary/20">
                            Community
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-muted-foreground border border-white/10">
                            General
                        </span>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold mb-6 text-foreground leading-tight">
                        {post.title}
                    </h1>

                    <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white font-bold">
                                    {post.author.username[0].toUpperCase()}
                                </div>
                                <span className="font-medium text-foreground">{post.author.username}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Eye className="w-4 h-4" />
                                <span>{post.views} views</span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            {canEdit && (
                                <>
                                    <Link href={`/board/${postId}/edit`}>
                                        <Button variant="outline" size="sm" className="h-8 gap-1">
                                            <Edit className="w-3 h-3" /> Edit
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="h-8 gap-1"
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                    >
                                        <Trash2 className="w-3 h-3" /> Delete
                                    </Button>
                                </>
                            )}
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10 hover:text-primary">
                                <Share2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-8 space-y-8">
                    {/* Images Grid */}
                    {post.imageUrls && post.imageUrls.length > 0 ? (
                        <div className={`grid gap-4 ${post.imageUrls.length === 1 ? 'grid-cols-1' :
                                post.imageUrls.length === 2 ? 'grid-cols-2' :
                                    'grid-cols-2 md:grid-cols-3'
                            }`}>
                            {post.imageUrls.map((url: string, index: number) => (
                                <div key={index} className="rounded-lg overflow-hidden border border-white/10 bg-black/50 aspect-video relative group">
                                    <img
                                        src={url}
                                        alt={`Attachment ${index + 1}`}
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                            ))}
                        </div>
                    ) : post.imageUrl && (
                        /* Fallback for old single image posts */
                        <div className="rounded-lg overflow-hidden border border-white/10 bg-black/50">
                            <img src={post.imageUrl} alt={post.title} className="w-full h-auto max-h-[600px] object-contain mx-auto" />
                        </div>
                    )}

                    <div className="prose prose-invert max-w-none">
                        <p className="whitespace-pre-wrap leading-relaxed text-lg text-foreground/90">
                            {post.content}
                        </p>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-white/5 bg-secondary/10 flex items-center justify-between">
                    <Button variant="ghost" className="gap-2 hover:text-primary">
                        <ThumbsUp className="w-4 h-4" /> Like
                    </Button>
                    <Button variant="ghost" className="gap-2 hover:text-primary">
                        <MessageSquare className="w-4 h-4" /> Comment
                    </Button>
                </div>
            </div>
        </div>
    );
}
