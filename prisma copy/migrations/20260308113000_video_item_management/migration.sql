CREATE TYPE "VideoItemType" AS ENUM ('SHORT', 'VIDEO');

CREATE TABLE "VideoItem" (
    "id" TEXT NOT NULL,
    "type" "VideoItemType" NOT NULL DEFAULT 'VIDEO',
    "title" TEXT NOT NULL,
    "views" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "thumbnail" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VideoItem_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "VideoItem_type_order_idx" ON "VideoItem"("type", "order");

INSERT INTO "VideoItem" ("id", "type", "title", "views", "duration", "thumbnail", "url", "order", "createdAt", "updatedAt") VALUES
('video-short-1', 'SHORT', 'Quick Tip #1', '50K', '0:30', 'bg-gradient-to-b from-red-500 to-orange-500', 'https://www.youtube.com/embed/tgbNymZ7vqY', 0, NOW(), NOW()),
('video-short-2', 'SHORT', 'Funny Moment', '120K', '0:30', 'bg-gradient-to-b from-blue-500 to-purple-500', 'https://www.youtube.com/embed/tgbNymZ7vqY', 1, NOW(), NOW()),
('video-short-3', 'SHORT', 'Dance Challenge', '1M', '0:30', 'bg-gradient-to-b from-pink-500 to-rose-500', 'https://www.youtube.com/embed/tgbNymZ7vqY', 2, NOW(), NOW()),
('video-short-4', 'SHORT', 'Life Hack', '300K', '0:30', 'bg-gradient-to-b from-green-500 to-teal-500', 'https://www.youtube.com/embed/tgbNymZ7vqY', 3, NOW(), NOW()),
('video-short-5', 'SHORT', 'Behind the Scenes', '80K', '0:30', 'bg-gradient-to-b from-yellow-500 to-amber-500', 'https://www.youtube.com/embed/tgbNymZ7vqY', 4, NOW(), NOW()),
('video-main-1', 'VIDEO', 'Neon City Walkthrough 4K', '1.2M', '12:34', 'bg-gradient-to-br from-purple-500 to-blue-500', 'https://www.youtube.com/embed/8GW6sLrK40k', 0, NOW(), NOW()),
('video-main-2', 'VIDEO', 'Cyberpunk 2077 Gameplay', '890K', '24:10', 'bg-gradient-to-br from-yellow-400 to-red-500', 'https://www.youtube.com/embed/P99qJGrPNLs', 1, NOW(), NOW()),
('video-main-3', 'VIDEO', 'Lo-Fi Beats to Code To', '3.4M', 'LIVE', 'bg-gradient-to-br from-pink-500 to-purple-500', 'https://www.youtube.com/embed/jfKfPfyJRdk', 2, NOW(), NOW()),
('video-main-4', 'VIDEO', 'Tech Review: New Gadgets', '450K', '10:05', 'bg-gradient-to-br from-green-400 to-blue-500', 'https://www.youtube.com/embed/7Pi99sFw50M', 3, NOW(), NOW()),
('video-main-5', 'VIDEO', 'Digital Art Tutorial', '230K', '15:20', 'bg-gradient-to-br from-orange-400 to-pink-500', 'https://www.youtube.com/embed/0xJ_qZ7_j9M', 4, NOW(), NOW()),
('video-main-6', 'VIDEO', 'Future of AI Documentary', '1.5M', '45:00', 'bg-gradient-to-br from-blue-600 to-cyan-400', 'https://www.youtube.com/embed/5dZ_lvDgevk', 5, NOW(), NOW()),
('video-main-7', 'VIDEO', 'Star TV Live Stream', 'LIVE', 'LIVE', 'bg-gradient-to-br from-red-600 to-orange-600', 'https://www.starstv.co/livetv/11/fcfcfc/fcfcfc/19756940/exk_bt1seamless/2d61c6b64ccaee55f17dd46b122e0f54/14.32.60.212/1771166460?=&fs=1&compact&590f53e8699817c6fa498cc11a4cbe63', 6, NOW(), NOW()),
('video-main-8', 'VIDEO', '제목은 어디서 파싱해온ㄴ걸까?', 'LIVE', 'LIVE', 'bg-gradient-to-br from-red-600 to-orange-600', 'https://www.starstv.co/livetv/3/fcfcfc/fcfcfc/19756947/exk_bt1seamless/5f3d6687f5a5dd56438522ccab0ed209/14.32.60.212/1771166871?=&fs=1&compact&590f53e8699817c6fa498cc11a4cbe63', 7, NOW(), NOW());
