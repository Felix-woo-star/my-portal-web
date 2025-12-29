"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "@/i18n/routing";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PenSquare, X } from "lucide-react";

import { useTranslations } from "next-intl";

export default function WritePostPage() {
    const t = useTranslations('BoardPage');
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();
    const { isAuthenticated, user } = useAuth();
    const [username, setUsername] = useState("");

    // Effect to set username from context
    useEffect(() => {
        if (user?.username) {
            setUsername(user.username);
        }
    }, [user]);
    const [images, setImages] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            const totalFiles = images.length + newFiles.length;

            if (totalFiles > 5) {
                alert("You can upload a maximum of 5 images.");
                return;
            }

            setImages(prev => [...prev, ...newFiles]);
        }
    };

    const handleRemoveImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        // Reset input value to allow selecting the same file again if needed
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!username) {
            setError("User session is invalid. Please logout and login again.");
            return;
        }

        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('content', content);
            formData.append('username', username);

            images.forEach(image => {
                formData.append('file', image);
            });

            const res = await fetch('/api/posts', {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                router.push("/board");
            } else {
                const data = await res.json();
                setError(data.error || "Failed to create post");
            }
        } catch (err) {
            setError("An error occurred");
        }
    };

    return (
        <div className="container mx-auto py-8 px-4 max-w-2xl">
            <Card className="bg-card/50 backdrop-blur border-white/10">
                <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="bg-primary/20 p-2 rounded-full">
                            <PenSquare className="h-5 w-5 text-primary" />
                        </div>
                        <CardTitle className="text-2xl font-bold">{t('writeTitle')}</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Username</label>
                            <Input
                                value={username}
                                readOnly
                                className="bg-secondary/50 border-white/10 opacity-50 cursor-not-allowed"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t('titleLabel')}</label>
                            <Input
                                placeholder={t('titleLabel')}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="bg-secondary/50 border-white/10"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t('contentLabel')}</label>
                            <Textarea
                                placeholder={t('contentPlaceholder')}
                                value={content}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
                                className="min-h-[200px] bg-secondary/50 border-white/10"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Images (Max 5)</label>
                            <div className="space-y-3">
                                <Input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageChange}
                                    className="bg-secondary/50 border-white/10 cursor-pointer"
                                    disabled={images.length >= 5}
                                />
                                {images.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {images.map((img, index) => (
                                            <div key={index} className="relative group bg-secondary rounded-md p-2 flex items-center gap-2 border border-white/10">
                                                <span className="text-sm truncate max-w-[150px]">{img.name}</span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                                    onClick={() => handleRemoveImage(index)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        {error && <p className="text-sm text-red-500">{error}</p>}
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="ghost" onClick={() => router.back()}>
                                {t('cancel')}
                            </Button>
                            <Button type="submit">
                                {t('publish')}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
