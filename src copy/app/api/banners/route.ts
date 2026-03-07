import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const banners = await prisma.banner.findMany({
            orderBy: { order: 'asc' },
        });
        return NextResponse.json(banners, {
            headers: {
                "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
            },
        });
    } catch {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const title = String(body.title ?? "").trim();
        const description = String(body.description ?? "").trim();

        if (!title || !description) {
            return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
        }

        const banner = await prisma.banner.create({
            data: {
                title,
                description,
                imageUrl: body.imageUrl,
                videoUrl: body.videoUrl,
                linkUrl: body.linkUrl,
                order: body.order ?? 0,
            },
        });
        return NextResponse.json(banner);
    } catch {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID required' }, { status: 400 });
        }

        await prisma.banner.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        // Handle reordering or updating
        if (Array.isArray(body)) {
            const updates = body
                .filter((item) => item && typeof item.id === "string" && typeof item.order === "number")
                .map((item) =>
                    prisma.banner.update({
                        where: { id: item.id },
                        data: { order: item.order },
                    }),
                );

            if (!updates.length) {
                return NextResponse.json({ error: "Invalid body" }, { status: 400 });
            }

            await prisma.$transaction(updates);
            return NextResponse.json({ success: true });
        }
        return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
    } catch {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { id, ...data } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID required' }, { status: 400 });
        }

        const banner = await prisma.banner.update({
            where: { id },
            data: {
                title: typeof data.title === "string" ? data.title.trim() : data.title,
                description: typeof data.description === "string" ? data.description.trim() : data.description,
                imageUrl: data.imageUrl,
                videoUrl: data.videoUrl,
                linkUrl: data.linkUrl,
            },
        });

        return NextResponse.json(banner);
    } catch {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
