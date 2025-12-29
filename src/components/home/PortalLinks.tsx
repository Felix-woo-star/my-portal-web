"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ExternalLink, Search, Youtube, Instagram, Facebook, Twitter, Twitch, Film, Globe, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

const portals = [
    { name: "Naver", href: "https://www.naver.com", color: "bg-[#03C75A]", icon: Search, description: "Korea's #1 Portal" },
    { name: "YouTube", href: "https://www.youtube.com", color: "bg-[#FF0000]", icon: Youtube, description: "Broadcast Yourself" },
    { name: "Google", href: "https://www.google.com", color: "bg-[#4285F4]", icon: Globe, description: "Search the World" },
    { name: "Instagram", href: "https://www.instagram.com", color: "bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]", icon: Instagram, description: "Capture & Share" },
    { name: "TikTok", href: "https://www.tiktok.com", color: "bg-[#000000]", icon: Film, description: "Make Your Day" },
    { name: "Twitter", href: "https://twitter.com", color: "bg-[#1DA1F2]", icon: Twitter, description: "What's Happening?" },
    { name: "Facebook", href: "https://www.facebook.com", color: "bg-[#1877F2]", icon: Facebook, description: "Connect with Friends" },
    { name: "Netflix", href: "https://www.netflix.com", color: "bg-[#E50914]", icon: Film, description: "See What's Next" },
    { name: "Twitch", href: "https://www.twitch.tv", color: "bg-[#9146FF]", icon: Twitch, description: "Live Streaming" },
    { name: "ChatGPT", href: "https://chat.openai.com", color: "bg-[#74AA9C]", icon: MessageCircle, description: "AI Assistant" },
];

/**
 * 외부 포털 사이트로 이동하는 링크 그리드 컴포넌트입니다.
 * 네이버, 유튜브 등 주요 사이트 바로가기를 제공합니다.
 */
export function PortalLinks() {
    const t = useTranslations('Portals');

    return (
        <section className="py-12 bg-background border-b border-white/10">
            <div className="container mx-auto px-4">
                <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
                    <span className="text-primary">#</span> {t('title')}
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {portals.map((portal, index) => (
                        <motion.a
                            key={portal.name}
                            href={portal.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative group overflow-hidden rounded-xl aspect-[2/1] flex flex-col items-center justify-center p-4 transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            {/* Background with color */}
                            <div className={`absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity ${portal.color}`} />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

                            {/* Content */}
                            <div className="relative z-10 flex flex-col items-center text-center">
                                <portal.icon className="h-8 w-8 mb-2 text-white drop-shadow-md group-hover:scale-110 transition-transform" />
                                <span className="font-bold text-lg text-white tracking-wide">{portal.name}</span>
                                <span className="text-xs text-white/70 mt-1 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                                    {portal.description}
                                </span>
                            </div>

                            {/* External Link Icon */}
                            <ExternalLink className="absolute top-2 right-2 h-3 w-3 text-white/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </motion.a>
                    ))}
                </div>
            </div>
        </section>
    );
}
