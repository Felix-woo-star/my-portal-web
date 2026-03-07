import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type { VideoItemType } from "@prisma/client";

function sanitize(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function toVideoType(value: unknown): VideoItemType | null {
  const normalized = sanitize(value).toUpperCase();
  if (normalized === "SHORT") return "SHORT";
  if (normalized === "VIDEO") return "VIDEO";
  return null;
}

async function isAdminUser(username: string) {
  if (!username) return false;
  const admin = await prisma.user.findFirst({
    where: { username, role: "ADMIN" },
    select: { id: true },
  });
  return Boolean(admin);
}

function extractBodyUsername(body: unknown) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return "";
  const payload = body as { username?: unknown };
  return sanitize(payload.username).toLowerCase();
}

async function ensureAdmin(request: Request, body?: unknown) {
  const headerUsername = sanitize(request.headers.get("x-username")).toLowerCase();
  const bodyUsername = extractBodyUsername(body);
  const queryUsername = sanitize(new URL(request.url).searchParams.get("username")).toLowerCase();
  const username = headerUsername || bodyUsername || queryUsername;

  if (!username) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = await isAdminUser(username);
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return null;
}

export async function GET() {
  try {
    const items = await prisma.videoItem.findMany({
      orderBy: [{ type: "asc" }, { order: "asc" }],
    });

    return NextResponse.json(items, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const unauthorized = await ensureAdmin(request, body);
    if (unauthorized) return unauthorized;

    const type = toVideoType(body.type);
    const title = sanitize(body.title);
    const views = sanitize(body.views);
    const duration = sanitize(body.duration);
    const thumbnail = sanitize(body.thumbnail);
    const url = sanitize(body.url);

    if (!type || !title || !views || !duration || !thumbnail || !url) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const maxOrder = await prisma.videoItem.aggregate({
      where: { type },
      _max: { order: true },
    });

    const item = await prisma.videoItem.create({
      data: {
        type,
        title,
        views,
        duration,
        thumbnail,
        url,
        order: (maxOrder._max.order ?? -1) + 1,
      },
    });

    return NextResponse.json(item);
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const unauthorized = await ensureAdmin(request, body);
    if (unauthorized) return unauthorized;

    const id = sanitize(body.id);
    const nextType = toVideoType(body.type);

    if (!id || !nextType) {
      return NextResponse.json({ error: "ID and valid type are required" }, { status: 400 });
    }

    const existing = await prisma.videoItem.findUnique({
      where: { id },
      select: { type: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    let nextOrder: number | undefined;
    if (existing.type !== nextType) {
      const maxOrder = await prisma.videoItem.aggregate({
        where: { type: nextType },
        _max: { order: true },
      });
      nextOrder = (maxOrder._max.order ?? -1) + 1;
    }

    const item = await prisma.videoItem.update({
      where: { id },
      data: {
        type: nextType,
        title: sanitize(body.title),
        views: sanitize(body.views),
        duration: sanitize(body.duration),
        thumbnail: sanitize(body.thumbnail),
        url: sanitize(body.url),
        ...(typeof nextOrder === "number" ? { order: nextOrder } : {}),
      },
    });

    return NextResponse.json(item);
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const unauthorized = await ensureAdmin(request, body);
    if (unauthorized) return unauthorized;

    if (!Array.isArray(body)) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    const updates = body
      .filter((item) => item && typeof item.id === "string" && typeof item.order === "number")
      .map((item) =>
        prisma.videoItem.update({
          where: { id: item.id },
          data: { order: item.order },
        }),
      );

    if (!updates.length) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    await prisma.$transaction(updates);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const unauthorized = await ensureAdmin(request);
    if (unauthorized) return unauthorized;

    const { searchParams } = new URL(request.url);
    const id = sanitize(searchParams.get("id"));

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    await prisma.videoItem.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
