import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

function sanitizeFileName(filename: string) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function saveUploadedFiles(files: File[]) {
  if (!files.length) {
    return [] as string[];
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const writeTasks = files
    .filter((file) => file.size > 0)
    .map(async (file) => {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${Date.now()}-${randomUUID()}-${sanitizeFileName(file.name)}`;
      const filepath = path.join(UPLOAD_DIR, filename);
      await writeFile(filepath, buffer);
      return `/uploads/${filename}`;
    });

  return Promise.all(writeTasks);
}

export async function deleteUploadedFiles(urls: string[]) {
  if (!urls.length) {
    return;
  }

  const deleteTasks = urls.map(async (url) => {
    const marker = "/uploads/";
    const markerIndex = url.indexOf(marker);
    if (markerIndex === -1) {
      return;
    }

    const filename = url.slice(markerIndex + marker.length);
    if (!filename) {
      return;
    }

    const filepath = path.join(UPLOAD_DIR, filename);
    await unlink(filepath);
  });

  await Promise.allSettled(deleteTasks);
}
