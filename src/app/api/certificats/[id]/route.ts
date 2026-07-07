import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { prisma } from "@/lib/db";
import { verifySession } from "@/lib/dal";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await verifySession();
  if (!session) return new NextResponse(null, { status: 401 });

  const { id } = await params;
  const certificat = await prisma.certificat.findUnique({
    where: { id },
    include: { eleve: true, inscription: { include: { session: { include: { formation: true } } } } },
  });

  if (!certificat) return new NextResponse(null, { status: 404 });
  if (certificat.eleveId !== session.userId && session.role !== "ADMIN") {
    return new NextResponse(null, { status: 403 });
  }

  const formation = certificat.inscription.session.formation;

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([842, 595]);
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const brass = rgb(0.66, 0.5, 0.31);
  const noir = rgb(0.08, 0.08, 0.06);

  page.drawRectangle({ x: 20, y: 20, width: 802, height: 555, borderColor: noir, borderWidth: 2 });

  page.drawText("RADIA GLAM ACADEMY", {
    x: 300,
    y: 480,
    size: 20,
    font,
    color: noir,
  });
  page.drawText("Certificat de reussite", {
    x: 320,
    y: 440,
    size: 16,
    font: fontRegular,
    color: brass,
  });
  page.drawText(certificat.eleve.nom, {
    x: 421 - certificat.eleve.nom.length * 6,
    y: 340,
    size: 28,
    font,
    color: noir,
  });
  page.drawText(`a suivi avec succes la formation`, {
    x: 300,
    y: 300,
    size: 12,
    font: fontRegular,
    color: noir,
  });
  page.drawText(formation.titre, {
    x: 421 - formation.titre.length * 5,
    y: 270,
    size: 18,
    font,
    color: brass,
  });
  page.drawText(`Numero : ${certificat.numero}`, {
    x: 60,
    y: 60,
    size: 10,
    font: fontRegular,
    color: noir,
  });
  page.drawText(`Delivre le ${certificat.delivreLe.toLocaleDateString("fr-FR")}`, {
    x: 620,
    y: 60,
    size: 10,
    font: fontRegular,
    color: noir,
  });

  const pdfBytes = await pdfDoc.save();

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="certificat-${certificat.numero}.pdf"`,
    },
  });
}
