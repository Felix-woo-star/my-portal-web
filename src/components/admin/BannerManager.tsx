"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, GripVertical } from "lucide-react";

interface Banner {
    id: string;
    title: string;
    description: string;
    imageUrl?: string;
    videoUrl?: string;
}

const DEFAULT_BANNERS: Banner[] = [
    {
        id: "1",
        title: "The Future Is Here",
        description: "Experience the next generation of digital interaction.",
        videoUrl: "https://cdn.pixabay.com/video/2023/10/22/186115-877653483_large.mp4",
    },
    {
        id: "2",
        title: "Connect & Share",
        description: "Join the community and share your vibe.",
        imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
    },
    {
        id: "3",
        title: "Trending Now",
        description: "See what's hot in the MZ world.",
        imageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2670&auto=format&fit=crop",
    },
];

export function BannerManager() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [newBanner, setNewBanner] = useState<Partial<Banner>>({});

    const fetchBanners = async () => {
        const res = await fetch('/api/banners');
        if (res.ok) {
            const data = await res.json();
            setBanners(data);
        }
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    const handleAddBanner = async () => {
        if (!newBanner.title || !newBanner.description) {
            alert("Title and Description are required");
            return;
        }

        try {
            const res = await fetch('/api/banners', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newBanner),
            });

            if (!res.ok) {
                const errorData = await res.json();
                alert(`Failed to add banner: ${errorData.error || res.statusText}`);
                return;
            }

            setNewBanner({});
            fetchBanners();
            alert("Banner added successfully!");
        } catch (error) {
            console.error("Error adding banner:", error);
            alert("An unexpected error occurred.");
        }
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
                <CardHeader>
                    <CardTitle>Add New Banner</CardTitle>
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
                    </div>
                    <Button onClick={handleAddBanner} className="w-full md:w-auto">
                        <Plus className="mr-2 h-4 w-4" /> Add Banner
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

                            <Button variant="destructive" size="icon" onClick={() => handleDeleteBanner(banner.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
