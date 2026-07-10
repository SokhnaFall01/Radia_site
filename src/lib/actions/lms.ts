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
      session: { formationId: lecon.formationId },
    },
  });
  if (!inscription) return null;

  return { lecon, inscription };
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

  revalidatePath(`/espace/formations/${access.lecon.formationId}/lecons/${leconId}`);
  redirect(`/espace/formations/${access.lecon.formationId}/lecons/${leconId}?score=${score}`);
}
