import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { deleteUploadedFiles, saveUploadedFiles } from "@/lib/uploads";

const POST_SELECT = {
  id: true,
  title: true,
  content: true,
  imageUrls: true,
  views: true,
  createdAt: true,
  author: {
    select: { username: true },
  },
};

async function isAdminUser(username: string) {
  if (!username) return false;
  const admin = await prisma.user.findFirst({
    where: { username, role: "ADMIN" },
    select: { id: true },
  });
  return Boolean(admin);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const post = await prisma.post.update({
      where: { id },
      data: { views: { increment: 1 } },
      select: POST_SELECT,
    });

    return NextResponse.json(post);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { username } = await request.json();

    const post = await prisma.post.findUnique({
      where: { id },
      select: {
        id: true,
        imageUrls: true,
        author: {
          select: { username: true },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const isAdmin = await isAdminUser(username);
    if (post.author.username !== username && !isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.post.delete({ where: { id } });
    await deleteUploadedFiles(post.imageUrls);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const formData = await request.formData();

    const title = String(formData.get("title") ?? "").trim();
    const content = String(formData.get("content") ?? "").trim();
    const username = String(formData.get("username") ?? "").trim();
    const existingImageUrls = formData
      .getAll("existingImages")
      .map(String)
      .filter(Boolean);
    const newFiles = formData
      .getAll("file")
      .filter((file): file is File => file instanceof File);

    if (!title || !content || !username) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const post = await prisma.post.findUnique({
      where: { id },
      select: {
        id: true,
        imageUrls: true,
        author: {
          select: { username: true },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const isAdmin = await isAdminUser(username);
    if (post.author.username !== username && !isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const newImageUrls = await saveUploadedFiles(newFiles);
    const finalImageUrls = [...existingImageUrls, ...newImageUrls];

    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        title,
        content,
        imageUrls: finalImageUrls,
      },
      select: POST_SELECT,
    });

    const removedImages = post.imageUrls.filter(
      (url) => !finalImageUrls.includes(url),
    );
    await deleteUploadedFiles(removedImages);

    return NextResponse.json(updatedPost);
  } catch {
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}
