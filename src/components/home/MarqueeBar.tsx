"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

/**
 * 흐르는 텍스트(Marquee) 효과를 주는 바 컴포넌트입니다.
 * 주요 뉴스나 트렌드를 반복적으로 보여줍니다.
 */
export function MarqueeBar() {
    const t = useTranslations('Marquee');

    return (
        <div className="w-full bg-primary text-primary-foreground py-3 overflow-hidden whitespace-nowrap border-y border-black/10">
            <motion.div
                className="inline-block"
                animate={{ x: ["0%", "-50%"] }}
                transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            >
                <span className="mx-8 text-lg font-bold tracking-wider">{t('news')}</span>
                <span className="mx-8 text-lg font-bold tracking-wider">{t('trending')}</span>
                <span className="mx-8 text-lg font-bold tracking-wider">{t('community')}</span>
                <span className="mx-8 text-lg font-bold tracking-wider">{t('news')}</span>
                <span className="mx-8 text-lg font-bold tracking-wider">{t('trending')}</span>
                <span className="mx-8 text-lg font-bold tracking-wider">{t('community')}</span>
            </motion.div>
        </div>
    );
}
