import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { saveUploadedFiles } from "@/lib/uploads";

const POST_SELECT = {
    id: true,
    title: true,
    content: true,
    imageUrls: true,
    views: true,
    createdAt: true,
    author: {
        select: {
            username: true,
        },
    },
};

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const rawLimit = searchParams.get("limit");
        const parsedLimit = rawLimit ? Number.parseInt(rawLimit, 10) : null;
        const take =
            parsedLimit && Number.isFinite(parsedLimit)
                ? Math.min(Math.max(parsedLimit, 1), 100)
                : undefined;

        const posts = await prisma.post.findMany({
            select: POST_SELECT,
            orderBy: {
                createdAt: 'desc',
            },
            take,
        });
        return NextResponse.json(posts);
    } catch {
        return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const title = formData.get('title') as string;
        const content = formData.get('content') as string;
        const username = formData.get('username') as string;
        const files = formData.getAll('file') as File[];

        if (!title || !content || !username) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { username },
            select: { id: true },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const imageUrls = await saveUploadedFiles(files);

        const post = await prisma.post.create({
            data: {
                title,
                content,
                authorId: user.id,
                imageUrls,
            },
            select: POST_SELECT,
        });

        return NextResponse.json(post);
    } catch (error) {
        console.error("Post creation error:", error);
        return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
    }
}
