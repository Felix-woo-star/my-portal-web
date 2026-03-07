import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

function sanitize(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

async function isAdminUser(username: string) {
  if (!username) return false;
  if (username.toLowerCase() === "admin") return true;

  const admin = await prisma.user.findFirst({
    where: { username, role: "ADMIN" },
    select: { id: true },
  });

  return Boolean(admin);
}

function extractBodyUsername(body: unknown) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return "";
  const payload = body as { username?: unknown };
  return sanitize(payload.username);
}

async function ensureAdmin(request: Request, body?: unknown) {
  const headerUsername = sanitize(request.headers.get("x-username"));
  const bodyUsername = extractBodyUsername(body);
  const queryUsername = sanitize(new URL(request.url).searchParams.get("username"));
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
    const portals = await prisma.quickPortal.findMany({
      orderBy: { order: "asc" },
    });

    return NextResponse.json(portals, {
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

    const name = sanitize(body.name);
    const href = sanitize(body.href);
    const description = sanitize(body.description);
    const color = sanitize(body.color);
    const iconKey = sanitize(body.iconKey).toLowerCase();

    if (!name || !href || !description || !color || !iconKey) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const maxOrder = await prisma.quickPortal.aggregate({
      _max: { order: true },
    });

    const portal = await prisma.quickPortal.create({
      data: {
        name,
        href,
        description,
        color,
        iconKey,
        order: (maxOrder._max.order ?? -1) + 1,
      },
    });

    return NextResponse.json(portal);
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

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    const portal = await prisma.quickPortal.update({
      where: { id },
      data: {
        name: sanitize(body.name),
        href: sanitize(body.href),
        description: sanitize(body.description),
        color: sanitize(body.color),
        iconKey: sanitize(body.iconKey).toLowerCase(),
      },
    });

    return NextResponse.json(portal);
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
        prisma.quickPortal.update({
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
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    await prisma.quickPortal.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
