import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

const LOOKBACK_DAYS = 30;
const CHART_DAYS = 7;
const ACTIVE_MINUTES = 5;
const IDLE_MINUTES = 30;
const MAX_RECENT_VISITORS = 5;
const BANNER_CLICK_PREFIX = "__banner_click__:";

type VisitEventType = "visit" | "banner_click";

interface VisitPayload {
  page?: string;
  type?: VisitEventType;
  username?: string;
  userRole?: string;
}

function toDayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getLastNDates(days: number) {
  const dates: Date[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date(now);
    date.setUTCDate(now.getUTCDate() - i);
    dates.push(date);
  }

  return dates;
}

function getVisitorKey(log: { id: string; ipAddress: string | null; userAgent: string | null }) {
  if (log.ipAddress) return `ip:${log.ipAddress}`;
  if (log.userAgent) return `ua:${log.userAgent}`;
  return `log:${log.id}`;
}

function maskIpAddress(ipAddress: string) {
  if (ipAddress.includes(".")) {
    const parts = ipAddress.split(".");
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.*.*`;
    }
  }

  if (ipAddress.includes(":")) {
    const parts = ipAddress.split(":");
    return `${parts.slice(0, 2).join(":")}::*`;
  }

  return "Guest";
}

function formatRelativeTime(now: Date, target: Date) {
  const diffMs = Math.max(0, now.getTime() - target.getTime());
  const minutes = Math.floor(diffMs / 60000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min${minutes === 1 ? "" : "s"} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;

  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function toStatus(now: Date, target: Date): "Active" | "Idle" | "Offline" {
  const diffMinutes = Math.floor((now.getTime() - target.getTime()) / 60000);
  if (diffMinutes <= ACTIVE_MINUTES) return "Active";
  if (diffMinutes <= IDLE_MINUTES) return "Idle";
  return "Offline";
}

function normalizePage(rawPage: string) {
  const trimmed = rawPage.trim().slice(0, 200);

  if (!trimmed) return "/";

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      const parsed = new URL(trimmed);
      return parsed.pathname || "/";
    } catch {
      return "/";
    }
  }

  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

function extractIpAddress(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || null;
  }

  const realIp = request.headers.get("x-real-ip");
  return realIp?.trim() || null;
}

function normalizeUsername(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().slice(0, 100);
  return trimmed || null;
}

function normalizeRole(value: unknown) {
  if (typeof value !== "string") return null;
  const upper = value.trim().toUpperCase();
  if (!upper) return null;
  return upper.slice(0, 30);
}

export async function GET() {
  try {
    const now = new Date();
    const lookbackStart = new Date(now);
    lookbackStart.setUTCDate(now.getUTCDate() - (LOOKBACK_DAYS - 1));

    const logs = await prisma.visitLog.findMany({
      where: {
        createdAt: { gte: lookbackStart },
        isAdmin: false,
      },
      select: {
        id: true,
        page: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 10000,
    });

    const chartDates = getLastNDates(CHART_DAYS);
    const chartMap = new Map(
      chartDates.map((date) => [toDayKey(date), { pageViews: 0, visitors: new Set<string>() }]),
    );

    const allVisitors = new Set<string>();
    const activeVisitors = new Set<string>();

    const activeThreshold = new Date(now);
    activeThreshold.setMinutes(now.getMinutes() - ACTIVE_MINUTES);

    for (const log of logs) {
      const visitorKey = getVisitorKey(log);
      allVisitors.add(visitorKey);

      if (log.createdAt >= activeThreshold) {
        activeVisitors.add(visitorKey);
      }

      const dayKey = toDayKey(log.createdAt);
      const bucket = chartMap.get(dayKey);
      if (bucket) {
        bucket.pageViews += 1;
        bucket.visitors.add(visitorKey);
      }
    }

    const formatter = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "UTC" });
    const chartData = chartDates.map((date) => {
      const dayKey = toDayKey(date);
      const bucket = chartMap.get(dayKey);
      return {
        name: formatter.format(date),
        visitors: bucket ? bucket.visitors.size : 0,
        pageViews: bucket ? bucket.pageViews : 0,
      };
    });

    const recentVisitors = logs.slice(0, MAX_RECENT_VISITORS).map((log) => {
      const page = log.page.startsWith(BANNER_CLICK_PREFIX)
        ? log.page.slice(BANNER_CLICK_PREFIX.length)
        : log.page;

      return {
        id: log.id,
        user: log.ipAddress ? maskIpAddress(log.ipAddress) : "Guest",
        page,
        time: formatRelativeTime(now, log.createdAt),
        status: toStatus(now, log.createdAt),
      };
    });

    const bannerClicks = logs.filter((log) => log.page.startsWith(BANNER_CLICK_PREFIX)).length;

    return NextResponse.json({
      chartData,
      recentVisitors,
      stats: {
        totalVisitors: allVisitors.size,
        pageViews: logs.length,
        bannerClicks,
        activeUsers: activeVisitors.size,
      },
    });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    let payload: VisitPayload = {};
    try {
      payload = (await request.json()) as VisitPayload;
    } catch {
      payload = {};
    }

    const eventType: VisitEventType = payload.type === "banner_click" ? "banner_click" : "visit";
    const page = normalizePage(typeof payload.page === "string" ? payload.page : "/");
    const username = normalizeUsername(payload.username);
    const userRole = normalizeRole(payload.userRole);
    const isAdmin = userRole === "ADMIN" || username?.toLowerCase() === "admin";

    const storedPage = eventType === "banner_click" ? `${BANNER_CLICK_PREFIX}${page}` : page;

    await prisma.visitLog.create({
      data: {
        page: storedPage,
        ipAddress: extractIpAddress(request),
        userAgent: request.headers.get("user-agent"),
        username,
        userRole,
        isAdmin,
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to save visit log" }, { status: 500 });
  }
}
