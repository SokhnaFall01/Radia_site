import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { parseQuizQuestions } from "@/lib/quiz";
import { markLeconComplete, submitQuiz } from "@/lib/actions/lms";
import QuizForm from "./quiz-form";
import LecteurVideo from "./lecteur-video";

export default async function LeconPage({
  params,
  searchParams,
}: {
  params: Promise<{ formationId: string; leconId: string }>;
  searchParams: Promise<{ score?: string }>;
}) {
  const session = await verifySession();
  if (!session) redirect("/connexion");
  const { formationId, leconId } = await params;
  const { score } = await searchParams;

  const inscription = await prisma.inscription.findFirst({
    where: { eleveId: session.userId, statut: "CONFIRMEE", session: { formationId } },
  });
  if (!inscription) notFound();

  const lecon = await prisma.lecon.findUnique({
    where: { id: leconId },
    include: { quiz: true },
  });
  if (!lecon || lecon.formationId !== formationId) notFound();

  const progression = await prisma.progression.findUnique({
    where: { eleveId_leconId: { eleveId: session.userId, leconId } },
  });

  const eleve = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { nom: true, email: true },
  });

  const questions = lecon.quiz ? parseQuizQuestions(lecon.quiz.questions) : [];
  const paragraphes = lecon.contenu.split("\n").map((l) => l.trim()).filter(Boolean);

  return (
    <section className="mx-auto max-w-2xl px-6 py-20">
      <p className="text-xs uppercase tracking-[0.1em] text-[var(--brass)]">
        <Link href={`/espace/formations/${formationId}`}>&larr; {lecon.titre}</Link>
      </p>
      <h1 className="font-display mt-3 text-2xl uppercase tracking-[0.12em]">{lecon.titre}</h1>

      {lecon.videoUrl && (
        <LecteurVideo
          videoUrl={lecon.videoUrl}
          filigrane={`${eleve?.nom ?? ""} — ${eleve?.email ?? ""}`}
        />
      )}

      {paragraphes.length > 0 && (
        <div className="mt-6 flex select-none flex-col gap-3 text-sm leading-relaxed text-[var(--gris)]">
          {paragraphes.map((par, i) => (
            <p key={i}>{par}</p>
          ))}
        </div>
      )}

      {lecon.pdfUrl && (
        <a
          href={`/api/cours/${lecon.id}/fichier`}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-block border border-[var(--noir)] px-5 py-3 text-xs uppercase tracking-[0.1em]"
        >
          Consulter le support PDF
        </a>
      )}

      {score !== undefined && (
        <p className="mt-6 border border-[var(--brass)] bg-[var(--blush)] px-4 py-3 text-sm">
          Score obtenu : {score}%{" "}
          {progression?.terminee ? "— leçon validée." : "— 70% minimum requis pour valider."}
        </p>
      )}

      {questions.length > 0 ? (
        <QuizForm questions={questions} action={submitQuiz.bind(null, leconId)} />
      ) : (
        <form action={markLeconComplete.bind(null, leconId)} className="mt-8">
          <button
            type="submit"
            disabled={progression?.terminee}
            className="border border-[var(--noir)] bg-[var(--noir)] px-6 py-3 text-xs uppercase tracking-[0.12em] text-[var(--porcelaine)] disabled:opacity-50"
          >
            {progression?.terminee ? "Leçon terminée" : "Marquer comme terminée"}
          </button>
        </form>
      )}
    </section>
  );
}
