import { createWriteStream } from "node:fs";
import { mkdir, unlink } from "node:fs/promises";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifySession } from "@/lib/dal";
import { coursFilePath } from "@/lib/uploads";

// Upload d'une vidéo de cours par l'admin. Les vidéos sont trop grosses pour
// les Server Actions (qui chargent tout en mémoire) : le fichier est envoyé
// en corps brut de la requête et écrit sur le disque au fil de l'eau.
const MAX_VIDEO_BYTES = 2 * 1024 * 1024 * 1024; // 2 Go

const VIDEO_TYPES: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

async function requireAdminLecon(leconId: string) {
  const session = await verifySession();
  if (!session || session.role !== "ADMIN") return null;
  const lecon = await prisma.lecon.findUnique({
    where: { id: leconId },
    select: { id: true, videoFichier: true },
  });
  return lecon;
}

async function supprimerAncienFichier(videoFichier: string | null) {
  if (!videoFichier || !/^[0-9a-f-]{36}\.(mp4|webm|mov)$/.test(videoFichier)) return;
  try {
    await unlink(coursFilePath(videoFichier));
  } catch {
    // le fichier n'existe plus : rien à faire
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ leconId: string }> }) {
  const { leconId } = await params;
  const lecon = await requireAdminLecon(leconId);
  if (!lecon) return NextResponse.json({ erreur: "Accès refusé." }, { status: 403 });

  const contentType = req.headers.get("content-type") ?? "";
  const extension = VIDEO_TYPES[contentType];
  if (!extension) {
    return NextResponse.json(
      { erreur: "Format non supporté (mp4, webm ou mov uniquement)." },
      { status: 415 },
    );
  }

  const contentLength = Number(req.headers.get("content-length"));
  if (!Number.isFinite(contentLength) || contentLength <= 0) {
    return NextResponse.json({ erreur: "Taille du fichier inconnue." }, { status: 411 });
  }
  if (contentLength > MAX_VIDEO_BYTES) {
    return NextResponse.json({ erreur: "Vidéo trop volumineuse (2 Go maximum)." }, { status: 413 });
  }
  if (!req.body) {
    return NextResponse.json({ erreur: "Corps de requête vide." }, { status: 400 });
  }

  const filename = `${crypto.randomUUID()}.${extension}`;
  const cible = coursFilePath(filename);
  await mkdir(path.dirname(cible), { recursive: true });

  try {
    await pipeline(
      Readable.fromWeb(req.body as import("node:stream/web").ReadableStream),
      createWriteStream(cible),
    );
  } catch {
    await supprimerAncienFichier(filename);
    return NextResponse.json({ erreur: "Échec de l'envoi. Réessayez." }, { status: 500 });
  }

  await supprimerAncienFichier(lecon.videoFichier);
  await prisma.lecon.update({ where: { id: leconId }, data: { videoFichier: filename } });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ leconId: string }> }) {
  const { leconId } = await params;
  const lecon = await requireAdminLecon(leconId);
  if (!lecon) return NextResponse.json({ erreur: "Accès refusé." }, { status: 403 });

  await supprimerAncienFichier(lecon.videoFichier);
  await prisma.lecon.update({ where: { id: leconId }, data: { videoFichier: null } });

  return NextResponse.json({ ok: true });
}
