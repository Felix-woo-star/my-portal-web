"use client";

import { useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import { useAuth } from "@/context/AuthContext";

interface AuthGateProps {
  children: React.ReactNode;
}

function normalizePath(pathname: string) {
  if (!pathname) return "/";
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

function isPublicPath(pathname: string) {
  const normalized = normalizePath(pathname);

  if (
    normalized === "/" ||
    normalized === "/login" ||
    normalized === "/signup" ||
    normalized === "/forgot-password" ||
    normalized === "/reset-password"
  ) {
    return true;
  }

  return routing.locales.some((locale) => {
    return (
      normalized === `/${locale}` ||
      normalized === `/${locale}/login` ||
      normalized === `/${locale}/signup` ||
      normalized === `/${locale}/forgot-password` ||
      normalized === `/${locale}/reset-password`
    );
  });
}

export function AuthGate({ children }: AuthGateProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const publicPath = useMemo(() => isPublicPath(pathname), [pathname]);

  useEffect(() => {
    if (!isAuthenticated && !publicPath) {
      router.replace("/login");
    }
  }, [isAuthenticated, publicPath, router]);

  if (!isAuthenticated && !publicPath) {
    return null;
  }

  return <>{children}</>;
}
