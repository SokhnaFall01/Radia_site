import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifySession } from "@/lib/dal";
import { coursFilePath } from "@/lib/uploads";

const CONTENT_TYPES: Record<string, string> = {
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
};

// Streaming de la vidéo d'une leçon, réservé aux élèves inscrites à la
// formation (et au staff). Le support des requêtes Range est indispensable :
// c'est ce qui permet au lecteur d'avancer/reculer sans tout télécharger.
export async function GET(req: Request, { params }: { params: Promise<{ leconId: string }> }) {
  const session = await verifySession();
  if (!session) return new NextResponse(null, { status: 401 });

  const { leconId } = await params;
  const lecon = await prisma.lecon.findUnique({
    where: { id: leconId },
    select: { videoFichier: true, formationId: true },
  });
  const match = lecon?.videoFichier
    ? /^[0-9a-f-]{36}\.(mp4|webm|mov)$/.exec(lecon.videoFichier)
    : null;
  if (!lecon?.videoFichier || !match) return new NextResponse(null, { status: 404 });

  if (session.role !== "ADMIN" && session.role !== "STAFF") {
    const inscription = await prisma.inscription.findFirst({
      where: {
        eleveId: session.userId,
        statut: "CONFIRMEE",
        session: { formationId: lecon.formationId },
      },
    });
    if (!inscription) return new NextResponse(null, { status: 403 });
  }

  const filePath = coursFilePath(lecon.videoFichier);
  let taille: number;
  try {
    taille = (await stat(filePath)).size;
  } catch {
    return new NextResponse(null, { status: 404 });
  }

  const contentType = CONTENT_TYPES[match[1]];
  const baseHeaders = {
    "Content-Type": contentType,
    "Accept-Ranges": "bytes",
    "Cache-Control": "private, no-store",
    "Content-Disposition": "inline",
  };

  const rangeHeader = req.headers.get("range");
  const rangeMatch = rangeHeader ? /^bytes=(\d*)-(\d*)$/.exec(rangeHeader) : null;

  if (rangeMatch && (rangeMatch[1] || rangeMatch[2])) {
    // "bytes=a-b", "bytes=a-" ou "bytes=-n" (n derniers octets)
    let start: number;
    let end: number;
    if (rangeMatch[1]) {
      start = Number(rangeMatch[1]);
      end = rangeMatch[2] ? Math.min(Number(rangeMatch[2]), taille - 1) : taille - 1;
    } else {
      start = Math.max(taille - Number(rangeMatch[2]), 0);
      end = taille - 1;
    }
    if (start >= taille || start > end) {
      return new NextResponse(null, {
        status: 416,
        headers: { "Content-Range": `bytes */${taille}` },
      });
    }

    const stream = Readable.toWeb(
      createReadStream(filePath, { start, end }),
    ) as unknown as ReadableStream;
    return new NextResponse(stream, {
      status: 206,
      headers: {
        ...baseHeaders,
        "Content-Range": `bytes ${start}-${end}/${taille}`,
        "Content-Length": String(end - start + 1),
      },
    });
  }

  const stream = Readable.toWeb(createReadStream(filePath)) as unknown as ReadableStream;
  return new NextResponse(stream, {
    status: 200,
    headers: { ...baseHeaders, "Content-Length": String(taille) },
  });
}
