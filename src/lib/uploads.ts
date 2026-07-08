import "server-only";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
// Doit rester en dessous de serverActions.bodySizeLimit (next.config.ts),
// sinon la requête est rejetée avant ce contrôle avec une erreur générique.
const MAX_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function saveUploadedPhoto(file: File | null): Promise<string | null> {
  if (!file || file.size === 0) return null;

  if (!(file.type in ALLOWED_TYPES)) {
    throw new Error("Format d'image non supporté (jpg, png ou webp uniquement).");
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error("Image trop volumineuse (10 Mo maximum).");
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const extension = ALLOWED_TYPES[file.type];
  const filename = `${crypto.randomUUID()}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);

  return `/uploads/${filename}`;
}
