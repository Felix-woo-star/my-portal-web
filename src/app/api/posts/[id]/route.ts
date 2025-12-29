import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const post = await prisma.post.findUnique({
            where: { id },
            include: {
                author: {
                    select: { username: true },
                },
            },
        });

        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        // Increment views
        await prisma.post.update({
            where: { id },
            data: { views: { increment: 1 } },
        });

        return NextResponse.json(post);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
    }
}

import { writeFile, unlink } from 'fs/promises';
import path from 'path';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { username } = await request.json(); // Expect username in body for auth check

        const post = await prisma.post.findUnique({
            where: { id },
            include: { author: true },
        });

        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        // Authorization Check
        // In a real app, you'd use a session. Here we trust the client-provided username 
        // because of the "Simple Auth" constraint, but verify against the DB author.
        const isAdmin = await prisma.user.findFirst({
            where: { username: username, role: 'ADMIN' }
        });

        if (post.author.username !== username && !isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Delete images from filesystem
        if (post.imageUrls && post.imageUrls.length > 0) {
            for (const url of post.imageUrls) {
                try {
                    const filename = url.split('/uploads/')[1];
                    if (filename) {
                        const filepath = path.join(process.cwd(), 'public', 'uploads', filename);
                        await unlink(filepath);
                    }
                } catch (e) {
                    console.error("Failed to delete image file:", e);
                }
            }
            // Legacy support: safely check for imageUrl by casting to any
        } else if ((post as any).imageUrl) {
            try {
                const filename = (post as any).imageUrl.split('/uploads/')[1];
                if (filename) {
                    const filepath = path.join(process.cwd(), 'public', 'uploads', filename);
                    await unlink(filepath);
                }
            } catch (e) {
                console.error("Failed to delete image file:", e);
            }
        }

        await prisma.post.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const formData = await request.formData();

        const title = formData.get('title') as string;
        const content = formData.get('content') as string;
        const username = formData.get('username') as string;
        const existingImageUrls = formData.getAll('existingImages') as string[];
        const newFiles = formData.getAll('file') as File[];

        const post = await prisma.post.findUnique({
            where: { id },
            include: { author: true },
        });

        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        // Authorization Check
        const isAdmin = await prisma.user.findFirst({
            where: { username: username, role: 'ADMIN' }
        });

        if (post.author.username !== username && !isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Handle New Image Uploads
        const newImageUrls: string[] = [];
        if (newFiles && newFiles.length > 0) {
            for (const file of newFiles) {
                if (file.size > 0) {
                    const bytes = await file.arrayBuffer();
                    const buffer = Buffer.from(bytes);
                    const filename = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
                    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
                    const filepath = path.join(uploadDir, filename);
                    await writeFile(filepath, buffer);
                    newImageUrls.push(`/uploads/${filename}`);
                }
            }
        }

        // Combine existing (kept) images and new uploads
        // existingImageUrls from client might be missing if they removed all, 
        // so we trust the client's "state of truth" for what remains.
        const finalImageUrls = [...existingImageUrls, ...newImageUrls];

        const updatedPost = await prisma.post.update({
            where: { id },
            data: {
                title,
                content,
                imageUrls: finalImageUrls
            },
        });

        return NextResponse.json(updatedPost);
    } catch (error) {
        console.error("PUT Error:", error);
        return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
    }
}
