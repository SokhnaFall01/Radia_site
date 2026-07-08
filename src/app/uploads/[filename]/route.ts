import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

// Les photos uploadees via l'admin sont ecrites dans public/uploads/ pendant
// que le serveur tourne. En production (output: "standalone"), Next fige la
// liste des fichiers de public/ au demarrage du serveur : tout fichier ajoute
// ensuite repond 404. Ce handler sert donc /uploads/* en lisant le disque a
// chaque requete. Les fichiers presents au demarrage restent servis par le
// serveur statique, qui a priorite sur cette route.
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

const FILENAME_PATTERN = /^[0-9a-f-]{36}\.(jpg|png|webp)$/;

export async function GET(_req: Request, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;

  const match = FILENAME_PATTERN.exec(filename);
  if (!match) return new NextResponse(null, { status: 404 });

  let data: Buffer;
  try {
    data = await readFile(path.join(UPLOAD_DIR, filename));
  } catch {
    return new NextResponse(null, { status: 404 });
  }

  return new NextResponse(new Uint8Array(data), {
    headers: {
      "Content-Type": CONTENT_TYPES[match[1]],
      // Nom de fichier = UUID : le contenu d'une URL ne change jamais.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
