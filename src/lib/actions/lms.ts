"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { verifySession } from "@/lib/dal";
import { parseQuizQuestions, PASSING_SCORE_PERCENT } from "@/lib/quiz";

async function assertAccess(eleveId: string, leconId: string) {
  const lecon = await prisma.lecon.findUnique({
    where: { id: leconId },
    include: { formation: true },
  });
  if (!lecon) return null;

  const inscription = await prisma.inscription.findFirst({
    where: {
      eleveId,
      statut: "CONFIRMEE",
      formationId: lecon.formationId,
    },
  });
  if (!inscription) return null;

  return { lecon, inscription };
}

async function maybeIssueCertificate(eleveId: string, formationId: string, inscriptionId: string) {
  const existing = await prisma.certificat.findUnique({ where: { inscriptionId } });
  if (existing) return;

  const lecons = await prisma.lecon.findMany({ where: { formationId }, select: { id: true } });
  if (lecons.length === 0) return;

  const progressions = await prisma.progression.findMany({
    where: { eleveId, leconId: { in: lecons.map((l) => l.id) }, terminee: true },
  });

  if (progressions.length < lecons.length) return;

  const numero = `RG-${new Date().getFullYear()}-${inscriptionId.slice(-8).toUpperCase()}`;
  await prisma.certificat.create({
    data: { inscriptionId, eleveId, numero },
  });
}

// Parcours d'achat digital (paiement manuel) : la cliente demande l'acces,
// l'inscription reste EN_ATTENTE_PAIEMENT jusqu'a validation par l'admin.
export async function demanderInscriptionFormation(formationId: string) {
  const session = await verifySession();
  if (!session) {
    redirect(`/connexion?next=${encodeURIComponent(`/academy/${formationId}/acheter`)}`);
  }

  const formation = await prisma.formation.findUnique({ where: { id: formationId } });
  if (!formation || !formation.publie) redirect("/academy");

  const existing = await prisma.inscription.findUnique({
    where: { eleveId_formationId: { eleveId: session.userId, formationId } },
  });

  if (existing?.statut === "CONFIRMEE") {
    redirect(`/espace/formations/${formationId}`);
  }

  if (!existing) {
    await prisma.inscription.create({
      data: { eleveId: session.userId, formationId, statut: "EN_ATTENTE_PAIEMENT" },
    });
  }

  redirect(`/academy/${formationId}/acheter?demande=1`);
}

export async function markLeconComplete(leconId: string) {
  const session = await verifySession();
  if (!session) redirect("/connexion");

  const access = await assertAccess(session.userId, leconId);
  if (!access) redirect("/espace/formations");

  await prisma.progression.upsert({
    where: { eleveId_leconId: { eleveId: session.userId, leconId } },
    update: { terminee: true },
    create: { eleveId: session.userId, leconId, terminee: true },
  });

  await maybeIssueCertificate(session.userId, access.lecon.formationId, access.inscription.id);
  revalidatePath(`/espace/formations/${access.lecon.formationId}`);
  redirect(`/espace/formations/${access.lecon.formationId}`);
}

export async function submitQuiz(leconId: string, formData: FormData) {
  const session = await verifySession();
  if (!session) redirect("/connexion");

  const access = await assertAccess(session.userId, leconId);
  if (!access) redirect("/espace/formations");

  const quiz = await prisma.quiz.findUnique({ where: { leconId } });
  if (!quiz) redirect(`/espace/formations/${access.lecon.formationId}`);

  const questions = parseQuizQuestions(quiz.questions);
  let correct = 0;
  questions.forEach((q, i) => {
    const answer = formData.get(`question-${i}`);
    if (answer !== null && Number(answer) === q.correctIndex) correct += 1;
  });
  const score = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
  const terminee = score >= PASSING_SCORE_PERCENT;

  await prisma.progression.upsert({
    where: { eleveId_leconId: { eleveId: session.userId, leconId } },
    update: { terminee, score },
    create: { eleveId: session.userId, leconId, terminee, score },
  });

  if (terminee) {
    await maybeIssueCertificate(session.userId, access.lecon.formationId, access.inscription.id);
  }

  revalidatePath(`/espace/formations/${access.lecon.formationId}/lecons/${leconId}`);
  redirect(`/espace/formations/${access.lecon.formationId}/lecons/${leconId}?score=${score}`);
}
