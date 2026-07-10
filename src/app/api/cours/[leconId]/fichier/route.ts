import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifySession } from "@/lib/dal";
import { coursFilePath } from "@/lib/uploads";

// Sert le support PDF d'une leçon. Les fichiers vivent dans data/cours,
// hors de public/ : seule une élève inscrite à la formation (ou le staff)
// peut les récupérer, et l'URL du fichier n'est jamais exposée.
export async function GET(_req: Request, { params }: { params: Promise<{ leconId: string }> }) {
  const session = await verifySession();
  if (!session) return new NextResponse(null, { status: 401 });

  const { leconId } = await params;
  const lecon = await prisma.lecon.findUnique({
    where: { id: leconId },
    select: { pdfUrl: true, titre: true, formationId: true },
  });
  if (!lecon?.pdfUrl || !/^[0-9a-f-]{36}\.pdf$/.test(lecon.pdfUrl)) {
    return new NextResponse(null, { status: 404 });
  }

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

  let data: Buffer;
  try {
    data = await readFile(coursFilePath(lecon.pdfUrl));
  } catch {
    return new NextResponse(null, { status: 404 });
  }

  return new NextResponse(new Uint8Array(data), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${lecon.titre.replace(/[^\w. -]/g, "_")}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
