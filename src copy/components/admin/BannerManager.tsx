"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, GripVertical, Pencil, X } from "lucide-react";

interface Banner {
    id: string;
    title: string;
    description: string;
    imageUrl?: string;
    videoUrl?: string;
    linkUrl?: string;
}

export function BannerManager() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [newBanner, setNewBanner] = useState<Partial<Banner>>({});
    const [editingId, setEditingId] = useState<string | null>(null);

    const fetchBanners = async () => {
        const res = await fetch('/api/banners');
        if (res.ok) {
            const data = await res.json();
            setBanners(data);
        }
    };

    useEffect(() => {
        let isMounted = true;

        const load = async () => {
            const res = await fetch('/api/banners');
            if (!isMounted || !res.ok) return;
            const data = await res.json();
            if (isMounted) {
                setBanners(data);
            }
        };

        void load();
        return () => {
            isMounted = false;
        };
    }, []);

    const handleAddBanner = async () => {
        if (!newBanner.title || !newBanner.description) {
            alert("Title and Description are required");
            return;
        }

        try {
            const url = editingId ? '/api/banners' : '/api/banners';
            const method = editingId ? 'PATCH' : 'POST';
            const body = editingId ? { ...newBanner, id: editingId } : newBanner;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const errorData = await res.json();
                alert(`Failed to save banner: ${errorData.error || res.statusText}`);
                return;
            }

            setNewBanner({});
            setEditingId(null);
            fetchBanners();
            alert(editingId ? "Banner updated successfully!" : "Banner added successfully!");
        } catch (error) {
            console.error("Error saving banner:", error);
            alert("An unexpected error occurred.");
        }
    };

    const handleEditBanner = (banner: Banner) => {
        setNewBanner(banner);
        setEditingId(banner.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setNewBanner({});
        setEditingId(null);
    };

    const handleDeleteBanner = async (id: string) => {
        await fetch(`/api/banners?id=${id}`, { method: 'DELETE' });
        fetchBanners();
    };

    const handleMoveUp = async (index: number) => {
        if (index === 0) return;
        const newBanners = [...banners];
        [newBanners[index - 1], newBanners[index]] = [newBanners[index], newBanners[index - 1]];

        // Update order optimistically then sync
        setBanners(newBanners);

        // Prepare batch update for order
        const updates = newBanners.map((b, idx) => ({ id: b.id, order: idx }));
        await fetch('/api/banners', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        });
    };

    const handleMoveDown = async (index: number) => {
        if (index === banners.length - 1) return;
        const newBanners = [...banners];
        [newBanners[index + 1], newBanners[index]] = [newBanners[index], newBanners[index + 1]];

        setBanners(newBanners);

        const updates = newBanners.map((b, idx) => ({ id: b.id, order: idx }));
        await fetch('/api/banners', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        });
    };

    return (
        <div className="space-y-8">
            <Card className="bg-card/50 border-white/10">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>{editingId ? "Edit Banner" : "Add New Banner"}</CardTitle>
                    {editingId && (
                        <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                            <X className="mr-2 h-4 w-4" /> Cancel Edit
                        </Button>
                    )}
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            placeholder="Title"
                            value={newBanner.title || ""}
                            onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                            className="bg-secondary/50"
                        />
                        <Input
                            placeholder="Description"
                            value={newBanner.description || ""}
                            onChange={(e) => setNewBanner({ ...newBanner, description: e.target.value })}
                            className="bg-secondary/50"
                        />
                        <Input
                            placeholder="Image URL (Optional)"
                            value={newBanner.imageUrl || ""}
                            onChange={(e) => setNewBanner({ ...newBanner, imageUrl: e.target.value })}
                            className="bg-secondary/50"
                        />
                        <Input
                            placeholder="Video URL (Optional)"
                            value={newBanner.videoUrl || ""}
                            onChange={(e) => setNewBanner({ ...newBanner, videoUrl: e.target.value })}
                            className="bg-secondary/50"
                        />
                        <Input
                            placeholder="Link URL (e.g., https://example.com)"
                            value={newBanner.linkUrl || ""}
                            onChange={(e) => setNewBanner({ ...newBanner, linkUrl: e.target.value })}
                            className="bg-secondary/50"
                        />
                    </div>

                    <Button onClick={handleAddBanner} className="w-full md:w-auto">
                        {editingId ? (
                            <>
                                <Pencil className="mr-2 h-4 w-4" /> Update Banner
                            </>
                        ) : (
                            <>
                                <Plus className="mr-2 h-4 w-4" /> Add Banner
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>

            <div className="space-y-4">
                <h3 className="text-xl font-bold">Current Banners</h3>
                {banners.map((banner, index) => (
                    <Card key={banner.id} className="bg-card/50 border-white/10">
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex flex-col gap-1">
                                <Button variant="ghost" size="icon" onClick={() => handleMoveUp(index)} disabled={index === 0}>
                                    <GripVertical className="h-4 w-4 rotate-90" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleMoveDown(index)} disabled={index === banners.length - 1}>
                                    <GripVertical className="h-4 w-4 -rotate-90" />
                                </Button>
                            </div>

                            <div className="h-20 w-32 bg-secondary rounded overflow-hidden flex-shrink-0">
                                {banner.videoUrl ? (
                                    <video src={banner.videoUrl} className="w-full h-full object-cover" muted />
                                ) : (
                                    <img src={banner.imageUrl || ''} alt={banner.title} className="w-full h-full object-cover" />
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold truncate">{banner.title}</h4>
                                <p className="text-sm text-muted-foreground truncate">{banner.description}</p>
                            </div>

                            <div className="flex gap-2">
                                <Button variant="outline" size="icon" onClick={() => handleEditBanner(banner)}>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="destructive" size="icon" onClick={() => handleDeleteBanner(banner.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div >
    );
}
