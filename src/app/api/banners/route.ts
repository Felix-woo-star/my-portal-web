import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const banners = await prisma.banner.findMany({
            orderBy: { order: 'asc' },
        });
        return NextResponse.json(banners);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const banner = await prisma.banner.create({
            data: {
                title: body.title,
                description: body.description,
                imageUrl: body.imageUrl,
                videoUrl: body.videoUrl,
                order: body.order ?? 0,
            },
        });
        return NextResponse.json(banner);
    } catch (error) {
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
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        // Handle reordering or updating
        if (Array.isArray(body)) {
            // Batch update for reordering
            for (const item of body) {
                await prisma.banner.update({
                    where: { id: item.id },
                    data: { order: item.order }
                });
            }
            return NextResponse.json({ success: true });
        }
        return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
