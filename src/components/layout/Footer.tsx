"use client";

import { Github, Twitter, Instagram } from "lucide-react";
import { useTranslations } from "next-intl";

/**
 * 하단 푸터 컴포넌트입니다.
 * 저작권 정보와 소셜 미디어 링크를 표시합니다.
 */
export function Footer() {
    const t = useTranslations('Navbar');

    return (
        <footer className="border-t border-white/10 bg-background py-8">
            <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">
                    &copy; {new Date().getFullYear()} MZ Portal. All rights reserved.
                </p>
                <div className="flex items-center gap-6">
                    <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                        <Twitter className="h-5 w-5" />
                        <span className="sr-only">Twitter</span>
                    </a>
                    <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                        <Instagram className="h-5 w-5" />
                        <span className="sr-only">Instagram</span>
                    </a>
                    <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                        <Github className="h-5 w-5" />
                        <span className="sr-only">GitHub</span>
                    </a>
                </div>
            </div>
        </footer>
    );
}
