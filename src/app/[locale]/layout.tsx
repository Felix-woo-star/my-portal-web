import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { AuthProvider } from "@/context/AuthContext";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "MZ Portal",
    description: "The trendiest portal for Gen Z",
};

/**
 * 애플리케이션의 최상위 레이아웃 컴포넌트입니다.
 * 전역 폰트, CSS, 테마, 그리고 공통 레이아웃(Navbar, Footer)을 관리합니다.
 * 
 * @param children - 레이아웃 내부에 렌더링될 자식 컴포넌트들
 * @param params - 라우트 파라미터 (locale 포함)
 */
export default async function RootLayout({
    children,
    params
}: Readonly<{
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}>) {
    const { locale } = await params;
    const messages = await getMessages();

    return (
        <html lang={locale} className="dark">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen flex flex-col`}
            >
                <NextIntlClientProvider messages={messages}>
                    <AuthProvider>
                        <Navbar />
                        <main className="flex-1">{children}</main>
                        <Footer />
                    </AuthProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
