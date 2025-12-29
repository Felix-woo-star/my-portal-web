import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const posts = await prisma.post.findMany({
            include: {
                author: {
                    select: { username: true },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return NextResponse.json(posts);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
    }
}

import { writeFile } from 'fs/promises';
import path from 'path';

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
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const imageUrls: string[] = [];
        if (files && files.length > 0) {
            const uploadDir = path.join(process.cwd(), 'public', 'uploads');

            for (const file of files) {
                if (file.size > 0) {
                    const bytes = await file.arrayBuffer();
                    const buffer = Buffer.from(bytes);

                    // Create unique filename
                    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.name.replace(/\s/g, '_')}`;
                    const filepath = path.join(uploadDir, filename);

                    try {
                        await writeFile(filepath, buffer);
                        imageUrls.push(`/uploads/${filename}`);
                    } catch (error) {
                        console.error("Error saving file:", error);
                        // Continue saving other files even if one fails
                    }
                }
            }
        }

        const post = await prisma.post.create({
            data: {
                title,
                content,
                authorId: user.id,
                imageUrls,
            },
        });

        return NextResponse.json(post);
    } catch (error) {
        console.error("Post creation error:", error);
        return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
    }
}
