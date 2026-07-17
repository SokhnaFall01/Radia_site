import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { parseQuizQuestions } from "@/lib/quiz";
import { updateLecon, addQuizQuestion, deleteQuizQuestion } from "@/lib/actions/admin";
import UploadVideo from "./upload-video";

export default async function AdminLeconPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; leconId: string }>;
  searchParams: Promise<{ maj?: string; erreur?: string }>;
}) {
  const session = await verifySession();
  if (!session) redirect("/connexion");
  if (session.role !== "ADMIN") redirect("/admin");
  const { id, leconId } = await params;
  const { maj, erreur } = await searchParams;

  const lecon = await prisma.lecon.findUnique({
    where: { id: leconId },
    include: { quiz: true },
  });
  if (!lecon || lecon.formationId !== id) notFound();

  const questions = lecon.quiz ? parseQuizQuestions(lecon.quiz.questions) : [];

  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <p className="text-xs uppercase tracking-[0.1em] text-[var(--brass)]">
        <Link href={`/admin/formations/${id}`}>&larr; Retour à la formation</Link>
      </p>
      <h1 className="font-display mt-3 text-2xl uppercase tracking-[0.12em]">{lecon.titre}</h1>

      {maj === "ok" && (
        <p className="mt-4 border border-[var(--brass)] bg-[var(--blush)] px-4 py-3 text-sm">
          Leçon mise à jour.
        </p>
      )}
      {erreur === "pdf" && (
        <p className="mt-4 border border-red-700 bg-red-50 px-4 py-3 text-sm text-red-700">
          Fichier invalide (PDF, 10 Mo max).
        </p>
      )}
      {erreur === "vdocipher" && (
        <p className="mt-4 border border-red-700 bg-red-50 px-4 py-3 text-sm text-red-700">
          ID de vidéo VdoCipher invalide : copiez l&apos;identifiant exact (Video ID) depuis le
          tableau de bord VdoCipher.
        </p>
      )}
      {erreur === "question" && (
        <p className="mt-4 border border-red-700 bg-red-50 px-4 py-3 text-sm text-red-700">
          Question invalide : renseignez l&apos;énoncé, au moins 2 options, et une bonne réponse
          parmi les options remplies.
        </p>
      )}

      <form action={updateLecon.bind(null, id, leconId)} className="mt-8 flex flex-col gap-4">
        <div className="grid grid-cols-[1fr_100px] gap-4">
          <div>
            <label className="text-xs uppercase tracking-[0.1em]" htmlFor="titre">Titre</label>
            <input id="titre" name="titre" defaultValue={lecon.titre} required className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.1em]" htmlFor="ordre">Ordre</label>
            <input id="ordre" name="ordre" type="number" min={1} defaultValue={lecon.ordre} required className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
          </div>
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.1em]" htmlFor="contenu">Texte du cours</label>
          <textarea id="contenu" name="contenu" rows={6} defaultValue={lecon.contenu} placeholder="Un paragraphe par ligne." className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.1em]" htmlFor="vdocipherId">
            Vidéo protégée DRM — ID VdoCipher (recommandé)
          </label>
          <input id="vdocipherId" name="vdocipherId" defaultValue={lecon.vdocipherId ?? ""} placeholder="ex: 1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d" className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
          <p className="mt-1 text-xs text-[var(--gris)]">
            Téléversez la vidéo sur le tableau de bord VdoCipher puis collez ici son « Video ID ».
            Captures et enregistrements d&apos;écran bloqués sur la plupart des téléphones. Cette
            vidéo est prioritaire sur les deux options ci-dessous.
          </p>
        </div>
        <UploadVideo leconId={leconId} videoPresente={Boolean(lecon.videoFichier)} />
        <div>
          <label className="text-xs uppercase tracking-[0.1em]" htmlFor="videoUrl">
            Lien vidéo externe (ignoré si une vidéo est hébergée ci-dessus)
          </label>
          <input id="videoUrl" name="videoUrl" type="url" defaultValue={lecon.videoUrl ?? ""} placeholder="ex: lien YouTube non répertorié, Vimeo, ou fichier .mp4" className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.1em]" htmlFor="pdf">
            Support PDF {lecon.pdfUrl ? "(un fichier est déjà en place — en choisir un autre le remplace)" : ""}
          </label>
          <input id="pdf" name="pdf" type="file" accept="application/pdf" className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
        </div>
        <button
          type="submit"
          className="self-start border border-[var(--noir)] bg-[var(--noir)] px-6 py-3 text-xs uppercase tracking-[0.12em] text-[var(--porcelaine)]"
        >
          Enregistrer
        </button>
      </form>

      <h2 className="mt-14 font-display text-sm uppercase tracking-[0.12em]">
        Quiz de la leçon
      </h2>
      <p className="mt-2 text-xs text-[var(--gris)]">
        S&apos;il y a des questions, l&apos;élève doit obtenir au moins 70&nbsp;% pour valider la
        leçon. Sans question, un simple bouton « Marquer comme terminée » est affiché.
      </p>

      <ul className="mt-4 flex flex-col gap-3">
        {questions.map((q, i) => (
          <li key={i} className="border border-[var(--ligne)] bg-white p-4 text-sm">
            <div className="flex items-start justify-between gap-4">
              <p className="font-medium">{i + 1}. {q.question}</p>
              <form action={deleteQuizQuestion.bind(null, id, leconId, i)}>
                <button type="submit" className="text-xs uppercase tracking-[0.1em] text-red-700">
                  Supprimer
                </button>
              </form>
            </div>
            <ul className="mt-2 flex flex-col gap-1 text-[var(--gris)]">
              {q.options.map((opt, j) => (
                <li key={j} className={j === q.correctIndex ? "font-medium text-[var(--brass)]" : ""}>
                  {j === q.correctIndex ? "✓" : "·"} {opt}
                </li>
              ))}
            </ul>
          </li>
        ))}
        {questions.length === 0 && (
          <p className="text-sm text-[var(--gris)]">Aucune question pour le moment.</p>
        )}
      </ul>

      <h3 className="mt-6 text-xs uppercase tracking-[0.12em] text-[var(--gris)]">Ajouter une question</h3>
      <form action={addQuizQuestion.bind(null, id, leconId)} className="mt-3 flex flex-col gap-4 border border-[var(--ligne)] bg-white p-5">
        <div>
          <label className="text-xs uppercase tracking-[0.1em]" htmlFor="question">Énoncé</label>
          <input id="question" name="question" required className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i}>
              <label className="text-xs uppercase tracking-[0.1em]" htmlFor={`option-${i}`}>
                Option {i + 1} {i >= 2 ? "(optionnel)" : ""}
              </label>
              <input id={`option-${i}`} name={`option-${i}`} required={i < 2} className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
            </div>
          ))}
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.1em]" htmlFor="correctIndex">Bonne réponse</label>
          <select id="correctIndex" name="correctIndex" className="mt-1 border border-[var(--noir)] bg-white px-3 py-2 text-sm">
            <option value={0}>Option 1</option>
            <option value={1}>Option 2</option>
            <option value={2}>Option 3</option>
            <option value={3}>Option 4</option>
          </select>
        </div>
        <button
          type="submit"
          className="self-start border border-[var(--noir)] px-5 py-2.5 text-xs uppercase tracking-[0.1em] hover:bg-[var(--noir)] hover:text-[var(--porcelaine)]"
        >
          Ajouter la question
        </button>
      </form>
    </section>
  );
}
