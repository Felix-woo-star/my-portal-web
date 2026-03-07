CREATE TABLE "QuickPortal" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "iconKey" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuickPortal_pkey" PRIMARY KEY ("id")
);

INSERT INTO "QuickPortal" ("id", "name", "href", "description", "color", "iconKey", "order", "createdAt", "updatedAt") VALUES
('quick-portal-pragmatic', '프라그마틱', 'https://client.pragmaticplaylive.net/desktop/lobby2/', '프라그마틱', 'bg-[#03C75A]', 'search', 0, NOW(), NOW()),
('quick-portal-naver', 'Naver', 'https://www.naver.com', 'Korea''s #1 Portal', 'bg-[#03C75A]', 'search', 1, NOW(), NOW()),
('quick-portal-youtube', 'YouTube', 'https://www.youtube.com', 'Broadcast Yourself', 'bg-[#FF0000]', 'youtube', 2, NOW(), NOW()),
('quick-portal-google', 'Google', 'https://www.google.com', 'Search the World', 'bg-[#4285F4]', 'globe', 3, NOW(), NOW()),
('quick-portal-instagram', 'Instagram', 'https://www.instagram.com', 'Capture & Share', 'bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]', 'instagram', 4, NOW(), NOW()),
('quick-portal-tiktok', 'TikTok', 'https://www.tiktok.com', 'Make Your Day', 'bg-[#000000]', 'film', 5, NOW(), NOW()),
('quick-portal-twitter', 'Twitter', 'https://twitter.com', 'What''s Happening?', 'bg-[#1DA1F2]', 'twitter', 6, NOW(), NOW()),
('quick-portal-facebook', 'Facebook', 'https://www.facebook.com', 'Connect with Friends', 'bg-[#1877F2]', 'facebook', 7, NOW(), NOW()),
('quick-portal-netflix', 'Netflix', 'https://www.netflix.com', 'See What''s Next', 'bg-[#E50914]', 'film', 8, NOW(), NOW()),
('quick-portal-twitch', 'Twitch', 'https://www.twitch.tv', 'Live Streaming', 'bg-[#9146FF]', 'twitch', 9, NOW(), NOW()),
('quick-portal-chatgpt', 'ChatGPT', 'https://chat.openai.com', 'AI Assistant', 'bg-[#74AA9C]', 'message-circle', 10, NOW(), NOW());
