import { HeroBanner } from "@/components/home/HeroBanner";
import { MarqueeBar } from "@/components/home/MarqueeBar";
import { PortalLinks } from "@/components/home/PortalLinks";
import { PostList } from "@/components/board/PostList";
import { VideoGrid } from "@/components/video/VideoGrid";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

/**
 * 메인 홈페이지 컴포넌트입니다.
 * 히어로 배너, 마키 바, 포털 링크, 그리고 주요 섹션 미리보기를 포함합니다.
 */
export default function Home() {
  const tBoard = useTranslations('Board');
  const tVideo = useTranslations('Video');

  return (
    <div className="flex flex-col min-h-screen">
      <HeroBanner />
      <MarqueeBar />
      <PortalLinks />

      <section className="container mx-auto py-16 px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold tracking-tight">{tBoard('title')}</h2>
          <Link href="/board">
            <Button variant="ghost" className="group">
              {tBoard('goToBoard')} <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
        <PostList />
      </section>

      <section className="container mx-auto py-16 px-4 border-t border-white/10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold tracking-tight">{tVideo('title')}</h2>
          <Link href="/video">
            <Button variant="ghost" className="group">
              {tVideo('watchMore')} <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
        <VideoGrid />
      </section>
    </div>
  );
}
