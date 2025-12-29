import { VideoGrid } from "@/components/video/VideoGrid";
import { Button } from "@/components/ui/button";
import { Flame, History } from "lucide-react";
import { useTranslations } from "next-intl";

/**
 * 비디오 피드 페이지 컴포넌트입니다.
 * 인기 숏폼 영상과 추천 비디오 그리드를 보여줍니다.
 */
export default function VideoPage() {
    const t = useTranslations('Video');

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex items-center justify-between mb-8">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        {t('title')} <Flame className="text-orange-500 fill-orange-500 animate-pulse" />
                    </h1>
                    <p className="text-muted-foreground">
                        {t('description')}
                    </p>
                </div>
                <Button variant="outline" className="hidden sm:flex items-center gap-2">
                    <History className="h-4 w-4" /> History
                </Button>
            </div>

            <VideoGrid />
        </div>
    );
}
