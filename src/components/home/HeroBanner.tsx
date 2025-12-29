"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

/**
 * 메인 페이지의 히어로 배너 컴포넌트입니다.
 * 애니메이션 배경과 주요 마케팅 메시지, CTA 버튼을 포함합니다.
 */
export function HeroBanner() {
    const t = useTranslations('Hero');
    const [banners, setBanners] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const res = await fetch('/api/banners');
                if (res.ok) {
                    const data = await res.json();
                    if (data.length > 0) {
                        setBanners(data);
                    } else {
                        // Default if no banners in DB
                        setBanners([{
                            id: "default",
                            title: t.raw('title'),
                            description: t('subtitle'),
                            videoUrl: null
                        }]);
                    }
                }
            } catch (e) {
                console.error("Failed to fetch banners", e);
            }
        };
        fetchBanners();
    }, [t]);

    useEffect(() => {
        if (banners.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % banners.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [banners.length]);

    if (banners.length === 0) return null;

    const currentBanner = banners[currentIndex];

    return (
        <section className="relative h-[80vh] w-full overflow-hidden flex items-center justify-center bg-black">
            {/* Background Media */}
            <div className="absolute inset-0 z-0">
                {currentBanner.videoUrl ? (
                    <video
                        src={currentBanner.videoUrl}
                        autoPlay
                        muted
                        loop
                        className="w-full h-full object-cover opacity-50"
                    />
                ) : currentBanner.imageUrl ? (
                    <img
                        src={currentBanner.imageUrl}
                        alt={currentBanner.title}
                        className="w-full h-full object-cover opacity-50"
                    />
                ) : (
                    <>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_#3b82f6_0%,_transparent_50%)] opacity-20 animate-pulse" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_#ec4899_0%,_transparent_40%)] opacity-20 animate-pulse delay-75" />
                    </>
                )}
                <div className="absolute inset-0 bg-black/40" />
            </div>

            <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1
                        className="text-6xl md:text-8xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/50"
                        dangerouslySetInnerHTML={{ __html: currentBanner.title }}
                    />

                    <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                        {currentBanner.description}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" className="text-lg px-8 py-6 bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_rgba(132,204,22,0.5)] transition-shadow">
                            {t('getStarted')} <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                        <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-white/20 hover:bg-white/10">
                            {t('learnMore')}
                        </Button>
                    </div>
                </motion.div>
            </div>

            {/* Indicators */}
            {banners.length > 1 && (
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2">
                    {banners.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? "bg-white w-8" : "bg-white/50 hover:bg-white/80"
                                }`}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
