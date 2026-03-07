"use client";

import { useEffect, useState } from "react";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTranslations } from "next-intl";

interface VideoItem {
    id: string;
    type: "SHORT" | "VIDEO";
    title: string;
    views: string;
    duration: string;
    thumbnail: string;
    url: string;
}

const DEFAULT_ITEMS: VideoItem[] = [
    { id: "default-short-1", type: "SHORT", title: "Quick Tip #1", views: "50K", duration: "0:30", thumbnail: "bg-gradient-to-b from-red-500 to-orange-500", url: "https://www.youtube.com/embed/tgbNymZ7vqY" },
    { id: "default-short-2", type: "SHORT", title: "Funny Moment", views: "120K", duration: "0:30", thumbnail: "bg-gradient-to-b from-blue-500 to-purple-500", url: "https://www.youtube.com/embed/tgbNymZ7vqY" },
    { id: "default-short-3", type: "SHORT", title: "Dance Challenge", views: "1M", duration: "0:30", thumbnail: "bg-gradient-to-b from-pink-500 to-rose-500", url: "https://www.youtube.com/embed/tgbNymZ7vqY" },
    { id: "default-short-4", type: "SHORT", title: "Life Hack", views: "300K", duration: "0:30", thumbnail: "bg-gradient-to-b from-green-500 to-teal-500", url: "https://www.youtube.com/embed/tgbNymZ7vqY" },
    { id: "default-short-5", type: "SHORT", title: "Behind the Scenes", views: "80K", duration: "0:30", thumbnail: "bg-gradient-to-b from-yellow-500 to-amber-500", url: "https://www.youtube.com/embed/tgbNymZ7vqY" },
    { id: "default-video-1", type: "VIDEO", title: "Neon City Walkthrough 4K", views: "1.2M", duration: "12:34", thumbnail: "bg-gradient-to-br from-purple-500 to-blue-500", url: "https://www.youtube.com/embed/8GW6sLrK40k" },
    { id: "default-video-2", type: "VIDEO", title: "Cyberpunk 2077 Gameplay", views: "890K", duration: "24:10", thumbnail: "bg-gradient-to-br from-yellow-400 to-red-500", url: "https://www.youtube.com/embed/P99qJGrPNLs" },
    { id: "default-video-3", type: "VIDEO", title: "Lo-Fi Beats to Code To", views: "3.4M", duration: "LIVE", thumbnail: "bg-gradient-to-br from-pink-500 to-purple-500", url: "https://www.youtube.com/embed/jfKfPfyJRdk" },
    { id: "default-video-4", type: "VIDEO", title: "Tech Review: New Gadgets", views: "450K", duration: "10:05", thumbnail: "bg-gradient-to-br from-green-400 to-blue-500", url: "https://www.youtube.com/embed/7Pi99sFw50M" },
    { id: "default-video-5", type: "VIDEO", title: "Digital Art Tutorial", views: "230K", duration: "15:20", thumbnail: "bg-gradient-to-br from-orange-400 to-pink-500", url: "https://www.youtube.com/embed/0xJ_qZ7_j9M" },
    { id: "default-video-6", type: "VIDEO", title: "Future of AI Documentary", views: "1.5M", duration: "45:00", thumbnail: "bg-gradient-to-br from-blue-600 to-cyan-400", url: "https://www.youtube.com/embed/5dZ_lvDgevk" },
    { id: "default-video-7", type: "VIDEO", title: "Star TV Live Stream", views: "LIVE", duration: "LIVE", thumbnail: "bg-gradient-to-br from-red-600 to-orange-600", url: "https://www.starstv.co/livetv/11/fcfcfc/fcfcfc/19756940/exk_bt1seamless/2d61c6b64ccaee55f17dd46b122e0f54/14.32.60.212/1771166460?=&fs=1&compact&590f53e8699817c6fa498cc11a4cbe63" },
    { id: "default-video-8", type: "VIDEO", title: "제목은 어디서 파싱해온ㄴ걸까?", views: "LIVE", duration: "LIVE", thumbnail: "bg-gradient-to-br from-red-600 to-orange-600", url: "https://www.starstv.co/livetv/3/fcfcfc/fcfcfc/19756947/exk_bt1seamless/5f3d6687f5a5dd56438522ccab0ed209/14.32.60.212/1771166871?=&fs=1&compact&590f53e8699817c6fa498cc11a4cbe63" },
];

function splitItems(items: VideoItem[]) {
    return {
        shorts: items.filter((item) => item.type === "SHORT"),
        videos: items.filter((item) => item.type === "VIDEO"),
    };
}

export function VideoGrid() {
    const t = useTranslations("Video");
    const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
    const [items, setItems] = useState<VideoItem[]>(DEFAULT_ITEMS);

    useEffect(() => {
        const controller = new AbortController();

        const fetchItems = async () => {
            try {
                const res = await fetch("/api/videos", {
                    signal: controller.signal,
                    cache: "no-store",
                });
                if (!res.ok) return;

                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                    setItems(data);
                }
            } catch {
                // Keep fallback items when API request fails.
            }
        };

        void fetchItems();
        return () => controller.abort();
    }, []);

    const { shorts, videos } = splitItems(items);

    return (
        <div className="space-y-12">
            <section>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <span className="text-primary">⚡</span> {t("shorts")}
                </h2>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                    {shorts.map((short) => (
                        <div
                            key={short.id}
                            className="flex-none w-[160px] group cursor-pointer"
                            onClick={() => setSelectedVideo(short)}
                        >
                            <div className={cn("w-full aspect-[9/16] rounded-xl relative overflow-hidden", short.thumbnail)}>
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                                <div className="absolute bottom-2 left-2 right-2">
                                    <p className="text-white font-bold text-sm line-clamp-2 drop-shadow-md">{short.title}</p>
                                    <p className="text-white/80 text-xs mt-1">{short.views} views</p>
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Play className="fill-white text-white h-12 w-12 drop-shadow-lg" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section>
                <h2 className="text-2xl font-bold mb-6">{t("recommended")}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {videos.map((video) => (
                        <div
                            key={video.id}
                            className="group cursor-pointer"
                            onClick={() => setSelectedVideo(video)}
                        >
                            <div className={cn("w-full aspect-video rounded-xl relative overflow-hidden mb-3", video.thumbnail)}>
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                                    {video.duration}
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Play className="fill-white text-white h-12 w-12 drop-shadow-lg" />
                                </div>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">{video.title}</h3>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                    <span>Channel Name</span>
                                    <span>•</span>
                                    <span>{video.views} views</span>
                                    <span>•</span>
                                    <span>2 days ago</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
                <DialogContent className="sm:max-w-[800px] bg-black/90 border-white/10 p-0 overflow-hidden">
                    <DialogHeader className="p-4 absolute z-10 w-full bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
                        <DialogTitle className="text-white drop-shadow-md">{selectedVideo?.title}</DialogTitle>
                    </DialogHeader>
                    <div className="aspect-video w-full">
                        {selectedVideo && (
                            <iframe
                                width="100%"
                                height="100%"
                                src={`${selectedVideo.url}${selectedVideo.url.includes('?') ? '&' : '?'}autoplay=1`}
                                title={selectedVideo.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="w-full h-full"
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
