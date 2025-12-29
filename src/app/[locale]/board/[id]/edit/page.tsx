"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, ImagePlus, X } from "lucide-react";
import { Link } from "@/i18n/routing";

export default function EditPostPage() {
    const t = useTranslations('BoardPage');
    const router = useRouter();
    const params = useParams(); // params.id is available here
    const { user, isAuthenticated } = useAuth();

    // Using string because params.id can be string | string[]
    const postId = Array.isArray(params.id) ? params.id[0] : params.id;

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    // Image management
    const [existingImages, setExistingImages] = useState<string[]>([]); // URLs of already uploaded images
    const [newImages, setNewImages] = useState<File[]>([]); // New files to upload
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch Post Data
    useEffect(() => {
        if (!postId) return;

        setIsFetching(true);
        fetch(`/api/posts/${postId}`)
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch post");
                return res.json();
            })
            .then(data => {
                setTitle(data.title);
                setContent(data.content);
                // Handle legacy imageUrl vs imageUrls
                if (data.imageUrls && data.imageUrls.length > 0) {
                    setExistingImages(data.imageUrls);
                } else if (data.imageUrl) {
                    setExistingImages([data.imageUrl]);
                }

                // Auth Check: Redirect if not author or admin
                // Note: user might be null initially if AuthContext is loading, so we rely on AuthContext's own checks usually, 
                // but checking here prevents flashing edit form to unauthorized users.
                // However, user object might populate slightly later.
                // For robustness, we check this inside the render or another effect when `user` is stable?
                // Let's rely on server rejection if user tries to submit, but client-side redirect is UX.
                // We'll leave it open for now or check if user is loaded.
            })
            .catch(err => {
                console.error(err);
                alert(t('errorLoad'));
                router.push('/board');
            })
            .finally(() => setIsFetching(false));
    }, [postId, router, t]);

    // Check authorization once both user and post data logic (implicitly) are settled
    // Realistically, we should check `user` against `post.author`. 
    // Since fetch doesn't return author in this simple snippet above without us asking, lets assume server handles it.

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            const totalImages = existingImages.length + newImages.length + filesArray.length;
            if (totalImages > 5) {
                alert(t('maxImagesError')); // Add translation key or hardcode fallback
                return;
            }
            setNewImages(prev => [...prev, ...filesArray]);
        }
    };

    const removeNewImage = (index: number) => {
        setNewImages(prev => prev.filter((_, i) => i !== index));
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const removeExistingImage = (urlToRemove: string) => {
        setExistingImages(prev => prev.filter(url => url !== urlToRemove));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim() || !content.trim()) return;
        if (!user || !user.username) {
            alert(t('loginRequired'));
            return;
        }

        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('content', content);
            formData.append('username', user.username);

            // Append existing images to keep
            existingImages.forEach(url => {
                formData.append('existingImages', url);
            });

            // Append new files
            newImages.forEach(file => {
                formData.append('file', file);
            });

            const res = await fetch(`/api/posts/${postId}`, {
                method: 'PUT',
                body: formData,
            });

            if (res.ok) {
                router.push(`/board/${postId}`);
                router.refresh();
            } else {
                const errorData = await res.json();
                alert(errorData.error || t('errorSave'));
            }
        } catch (error) {
            console.error(error);
            alert(t('errorSave'));
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!isAuthenticated) {
        // Should redirect or show message
        return <div className="p-10 text-center">{t('loginRequired')}</div>;
    }

    return (
        <div className="container mx-auto py-10 px-4 max-w-3xl">
            <Link href={`/board/${postId}`} className="inline-flex items-center text-muted-foreground hover:text-primary mb-6 transition-colors">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('back')}
            </Link>

            <Card className="border-white/10 bg-card/50 backdrop-blur">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                        Edit Post
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Username (Read-only) */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">{t('author')}</label>
                            <Input
                                type="text"
                                value={user?.username || ''}
                                disabled
                                className="bg-secondary/50 border-white/5 opacity-70 cursor-not-allowed text-muted-foreground"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="title" className="text-sm font-medium">{t('postTitle')}</label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder={t('titlePlaceholder')}
                                required
                                className="bg-secondary/50 border-white/10 focus:border-primary/50 transition-colors"
                            />
                        </div>

                        {/* Image Upload Section */}
                        <div className="space-y-4 p-4 rounded-lg bg-secondary/20 border border-white/5">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <ImagePlus className="w-4 h-4 text-primary" />
                                    Images (Max 5)
                                </label>
                                <span className="text-xs text-muted-foreground">
                                    {existingImages.length + newImages.length} / 5
                                </span>
                            </div>

                            {/* Existing Images */}
                            {existingImages.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                    {existingImages.map((url, idx) => (
                                        <div key={`existing-${idx}`} className="relative group aspect-square rounded-md overflow-hidden bg-background border border-white/10">
                                            <img src={url} alt={`Existing ${idx}`} className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeExistingImage(url)}
                                                className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[10px] text-white p-1 text-center truncate">
                                                Existing
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* New Images */}
                            {newImages.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                    {newImages.map((file, idx) => (
                                        <div key={`new-${idx}`} className="relative group aspect-square rounded-md overflow-hidden bg-background border border-white/10">
                                            <div className="w-full h-full flex items-center justify-center bg-secondary text-xs text-muted-foreground p-2 text-center break-all">
                                                {file.name}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeNewImage(idx)}
                                                className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                            <div className="absolute bottom-0 left-0 right-0 bg-green-500/60 text-[10px] text-white p-1 text-center">
                                                New
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <Input
                                ref={fileInputRef}
                                id="image"
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageChange}
                                disabled={existingImages.length + newImages.length >= 5}
                                className="cursor-pointer file:cursor-pointer file:text-primary file:bg-primary/10 file:border-0 file:rounded-md file:mr-4 hover:file:bg-primary/20"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="content" className="text-sm font-medium">{t('postContent')}</label>
                            <textarea
                                id="content"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder={t('contentPlaceholder')}
                                required
                                className="flex min-h-[300px] w-full rounded-md border border-white/10 bg-secondary/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                            />
                        </div>

                        <div className="flex justify-end gap-4">
                            <Link href={`/board/${postId}`}>
                                <Button type="button" variant="ghost">
                                    {t('cancel')}
                                </Button>
                            </Link>
                            <Button
                                type="submit"
                                disabled={isLoading || existingImages.length + newImages.length > 5}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    'Update Post'
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
