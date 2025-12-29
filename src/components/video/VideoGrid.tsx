"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// 비디오 데이터 타입 정의
interface Video {
    id: number;
    title: string;
    views: string;
    duration: string;
    thumbnail: string;
    url: string; // YouTube Embed URL
}

// 숏폼 데이터 타입 정의
interface Short {
    id: number;
    title: string;
    views: string;
    thumbnail: string;
    url: string; // YouTube Embed URL
}

const videos: Video[] = [
    { id: 1, title: "Neon City Walkthrough 4K", views: "1.2M", duration: "12:34", thumbnail: "bg-gradient-to-br from-purple-500 to-blue-500", url: "https://www.youtube.com/embed/8GW6sLrK40k" },
    { id: 2, title: "Cyberpunk 2077 Gameplay", views: "890K", duration: "24:10", thumbnail: "bg-gradient-to-br from-yellow-400 to-red-500", url: "https://www.youtube.com/embed/P99qJGrPNLs" },
    { id: 3, title: "Lo-Fi Beats to Code To", views: "3.4M", duration: "LIVE", thumbnail: "bg-gradient-to-br from-pink-500 to-purple-500", url: "https://www.youtube.com/embed/jfKfPfyJRdk" },
    { id: 4, title: "Tech Review: New Gadgets", views: "450K", duration: "10:05", thumbnail: "bg-gradient-to-br from-green-400 to-blue-500", url: "https://www.youtube.com/embed/7Pi99sFw50M" },
    { id: 5, title: "Digital Art Tutorial", views: "230K", duration: "15:20", thumbnail: "bg-gradient-to-br from-orange-400 to-pink-500", url: "https://www.youtube.com/embed/0xJ_qZ7_j9M" },
    { id: 6, title: "Future of AI Documentary", views: "1.5M", duration: "45:00", thumbnail: "bg-gradient-to-br from-blue-600 to-cyan-400", url: "https://www.youtube.com/embed/5dZ_lvDgevk" },
];

const shorts: Short[] = [
    { id: 101, title: "Quick Tip #1", views: "50K", thumbnail: "bg-gradient-to-b from-red-500 to-orange-500", url: "https://www.youtube.com/embed/tgbNymZ7vqY" },
    { id: 102, title: "Funny Moment", views: "120K", thumbnail: "bg-gradient-to-b from-blue-500 to-purple-500", url: "https://www.youtube.com/embed/tgbNymZ7vqY" },
    { id: 103, title: "Dance Challenge", views: "1M", thumbnail: "bg-gradient-to-b from-pink-500 to-rose-500", url: "https://www.youtube.com/embed/tgbNymZ7vqY" },
    { id: 104, title: "Life Hack", views: "300K", thumbnail: "bg-gradient-to-b from-green-500 to-teal-500", url: "https://www.youtube.com/embed/tgbNymZ7vqY" },
    { id: 105, title: "Behind the Scenes", views: "80K", thumbnail: "bg-gradient-to-b from-yellow-500 to-amber-500", url: "https://www.youtube.com/embed/tgbNymZ7vqY" },
];

/**
 * 비디오 그리드 컴포넌트입니다.
 * 숏폼 비디오(가로 스크롤)와 추천 비디오(그리드) 섹션을 포함합니다.
 * 클릭 시 모달창에서 유튜브 영상을 재생합니다.
 */
export function VideoGrid() {
    const [selectedVideo, setSelectedVideo] = useState<Video | Short | null>(null);

    return (
        <div className="space-y-12">
            {/* Shorts Section */}
            <section>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <span className="text-primary">⚡</span> Trending Shorts
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

            {/* Main Video Grid */}
            <section>
                <h2 className="text-2xl font-bold mb-6">Recommended for You</h2>
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

            {/* Video Player Modal */}
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
                                src={`${selectedVideo.url}?autoplay=1`}
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
