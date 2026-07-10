import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";
import { prisma } from "@/lib/db";
import { verifySession } from "@/lib/dal";

const BRUN = rgb(0.231, 0.165, 0.125); // #3b2a20
const BEIGE = rgb(0.863, 0.804, 0.725); // #dccdb9
const FOND = rgb(0.98, 0.969, 0.949); // #faf7f2

function centerX(text: string, font: PDFFont, size: number, pageWidth: number) {
  return (pageWidth - font.widthOfTextAtSize(text, size)) / 2;
}

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
  const sessionFormation = certificat.inscription.session;

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([842, 595]);
  const { width, height } = page.getSize();

  const serif = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const serifBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const serifItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
  const sans = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const logoPng = await pdfDoc.embedPng(
    await readFile(path.join(process.cwd(), "public", "brand", "logo-principal.png")),
  );
  const monogrammePng = await pdfDoc.embedPng(
    await readFile(path.join(process.cwd(), "public", "brand", "monogramme.png")),
  );

  // Fond et double cadre aux couleurs de la marque
  page.drawRectangle({ x: 0, y: 0, width, height, color: FOND });
  page.drawRectangle({ x: 24, y: 24, width: width - 48, height: height - 48, borderColor: BRUN, borderWidth: 2 });
  page.drawRectangle({ x: 32, y: 32, width: width - 64, height: height - 64, borderColor: BEIGE, borderWidth: 1 });

  // Logo en tête
  const logoH = 130;
  const logoW = (logoPng.width / logoPng.height) * logoH;
  page.drawImage(logoPng, { x: (width - logoW) / 2, y: height - 60 - logoH, width: logoW, height: logoH });

  // Titre
  const titre = "CERTIFICAT DE RÉUSSITE";
  page.drawText(titre, { x: centerX(titre, serifBold, 26, width), y: height - 235, size: 26, font: serifBold, color: BRUN });
  page.drawLine({ start: { x: width / 2 - 90, y: height - 248 }, end: { x: width / 2 + 90, y: height - 248 }, thickness: 1, color: BEIGE });

  const decerne = "est décerné à";
  page.drawText(decerne, { x: centerX(decerne, serifItalic, 14, width), y: height - 278, size: 14, font: serifItalic, color: BRUN });

  const nom = certificat.eleve.nom;
  page.drawText(nom, { x: centerX(nom, serifBold, 30, width), y: height - 318, size: 30, font: serifBold, color: BRUN });

  const pour = "pour avoir suivi avec succès la formation";
  page.drawText(pour, { x: centerX(pour, serif, 13, width), y: height - 348, size: 13, font: serif, color: BRUN });

  const titreFormation = formation.titre;
  page.drawText(titreFormation, {
    x: centerX(titreFormation, serifBold, 19, width),
    y: height - 378,
    size: 19,
    font: serifBold,
    color: BRUN,
  });

  const periode = `${formation.duree} — session du ${sessionFormation.dateDebut.toLocaleDateString("fr-FR")} au ${sessionFormation.dateFin.toLocaleDateString("fr-FR")}`;
  page.drawText(periode, { x: centerX(periode, serif, 11, width), y: height - 400, size: 11, font: serif, color: BRUN });

  // Bloc signature (bas droite)
  const sigX = width - 260;
  page.drawText("Radia Glam", { x: sigX + 30, y: 130, size: 26, font: serifItalic, color: BRUN });
  page.drawLine({ start: { x: sigX, y: 118 }, end: { x: sigX + 200, y: 118 }, thickness: 1, color: BRUN });
  page.drawText("La fondatrice", { x: sigX + 60, y: 102, size: 10, font: sans, color: BRUN });
  page.drawText("Révèle ta lumière.", { x: sigX + 48, y: 86, size: 11, font: serifItalic, color: BRUN });

  // Monogramme (bas gauche) + mentions officielles
  page.drawImage(monogrammePng, { x: 64, y: 84, width: 64, height: 64 });
  page.drawText(`Certificat n° ${certificat.numero}`, { x: 64, y: 66, size: 9, font: sans, color: BRUN });
  page.drawText(`Délivré le ${certificat.delivreLe.toLocaleDateString("fr-FR")} — Radia Glam Academy, Dakar`, {
    x: 64,
    y: 52,
    size: 9,
    font: sans,
    color: BRUN,
  });

  const pdfBytes = await pdfDoc.save();

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="certificat-${certificat.numero}.pdf"`,
    },
  });
}
