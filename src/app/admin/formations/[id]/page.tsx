import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/db";
import {
  updateFormation,
  deleteFormation,
  createFormationSession,
  deleteFormationSession,
  createLecon,
  deleteLecon,
  inscrireEleve,
  validerCertificat,
} from "@/lib/actions/admin";

export default async function AdminFormationEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ maj?: string; erreur?: string }>;
}) {
  const session = await verifySession();
  if (!session) redirect("/connexion");
  if (session.role !== "ADMIN") redirect("/admin");
  const { id } = await params;
  const { maj, erreur } = await searchParams;

  const formation = await prisma.formation.findUnique({
    where: { id },
    include: {
      lecons: { orderBy: { ordre: "asc" }, include: { quiz: true } },
      sessions: {
        orderBy: { dateDebut: "asc" },
        include: {
          inscriptions: {
            where: { statut: "CONFIRMEE" },
            include: { eleve: true, certificat: true },
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
  });
  if (!formation) notFound();

  const leconIds = formation.lecons.map((l) => l.id);
  const progressions = leconIds.length
    ? await prisma.progression.findMany({
        where: { leconId: { in: leconIds }, terminee: true },
        select: { eleveId: true },
      })
    : [];
  const terminesParEleve = new Map<string, number>();
  for (const prog of progressions) {
    terminesParEleve.set(prog.eleveId, (terminesParEleve.get(prog.eleveId) ?? 0) + 1);
  }

  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <p className="text-xs uppercase tracking-[0.1em] text-[var(--brass)]">
        <Link href="/admin/formations">&larr; Formations</Link>
      </p>
      <h1 className="font-display mt-3 text-2xl uppercase tracking-[0.12em]">{formation.titre}</h1>

      {maj === "ok" && (
        <p className="mt-4 border border-[var(--brass)] bg-[var(--blush)] px-4 py-3 text-sm">
          Formation mise à jour.
        </p>
      )}
      {erreur === "suppression" && (
        <p className="mt-4 border border-red-700 bg-red-50 px-4 py-3 text-sm text-red-700">
          Impossible de supprimer cette session : des inscriptions y sont liées.
        </p>
      )}

      {maj === "inscrite" && (
        <p className="mt-4 border border-[var(--brass)] bg-[var(--blush)] px-4 py-3 text-sm">
          Élève inscrite à la session.
        </p>
      )}
      {maj === "certificat" && (
        <p className="mt-4 border border-[var(--brass)] bg-[var(--blush)] px-4 py-3 text-sm">
          Certificat généré. L&apos;élève peut le télécharger depuis son espace.
        </p>
      )}
      {erreur === "eleve-introuvable" && (
        <p className="mt-4 border border-red-700 bg-red-50 px-4 py-3 text-sm text-red-700">
          Aucun compte avec cet email. L&apos;élève doit d&apos;abord créer son compte sur le site.
        </p>
      )}
      {erreur === "deja-inscrite" && (
        <p className="mt-4 border border-red-700 bg-red-50 px-4 py-3 text-sm text-red-700">
          Cette élève est déjà inscrite à cette session.
        </p>
      )}
      {erreur === "pdf" && (
        <p className="mt-4 border border-red-700 bg-red-50 px-4 py-3 text-sm text-red-700">
          Fichier invalide (PDF, 10 Mo max).
        </p>
      )}
      {erreur === "photo" && (
        <p className="mt-4 border border-red-700 bg-red-50 px-4 py-3 text-sm text-red-700">
          Photo invalide (jpg/png/webp, 10 Mo max).
        </p>
      )}

      <form action={updateFormation.bind(null, id)} className="mt-8 flex flex-col gap-4">
        <div>
          <label className="text-xs uppercase tracking-[0.1em]" htmlFor="titre">Titre</label>
          <input id="titre" name="titre" defaultValue={formation.titre} required className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.1em]" htmlFor="photo">Photo</label>
          {formation.photos[0] && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={formation.photos[0]} alt="" className="mt-2 h-28 w-28 object-cover" />
          )}
          <input id="photo" name="photo" type="file" accept="image/jpeg,image/png,image/webp" className="mt-2 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.1em]" htmlFor="description">Description courte (cartes et listes)</label>
          <textarea id="description" name="description" defaultValue={formation.description} required rows={3} className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.1em]" htmlFor="presentation">Présentation (page de la formation)</label>
          <textarea id="presentation" name="presentation" defaultValue={formation.presentation} rows={5} placeholder="Texte long affiché sur la page publique de la formation. Un paragraphe par ligne." className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.1em]" htmlFor="programme">Programme</label>
          <textarea id="programme" name="programme" defaultValue={formation.programme} required rows={3} placeholder="Un point du programme par ligne." className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.1em]" htmlFor="modalitesAcces">Modalités d&apos;accès</label>
          <textarea id="modalitesAcces" name="modalitesAcces" defaultValue={formation.modalitesAcces} rows={3} placeholder="ex: inscription en ligne ou au salon, acompte, matériel fourni..." className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.1em]" htmlFor="prerequis">Prérequis</label>
          <textarea id="prerequis" name="prerequis" defaultValue={formation.prerequis} rows={2} placeholder="ex: aucun prérequis, ouvert aux débutantes" className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-xs uppercase tracking-[0.1em]" htmlFor="duree">Durée</label>
            <input id="duree" name="duree" defaultValue={formation.duree} required className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.1em]" htmlFor="niveau">Niveau</label>
            <input id="niveau" name="niveau" defaultValue={formation.niveau} required className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.1em]" htmlFor="tarifFcfa">Tarif (FCFA)</label>
            <input id="tarifFcfa" name="tarifFcfa" type="number" min={0} defaultValue={formation.tarifFcfa} required className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="publie" defaultChecked={formation.publie} />
          Publiée (visible sur /academy)
        </label>
        <button
          type="submit"
          className="mt-2 self-start border border-[var(--noir)] bg-[var(--noir)] px-6 py-3 text-xs uppercase tracking-[0.12em] text-[var(--porcelaine)]"
        >
          Enregistrer
        </button>
      </form>

      <form action={deleteFormation.bind(null, id)} className="mt-4">
        <button type="submit" className="border border-red-700 px-5 py-2.5 text-xs uppercase tracking-[0.1em] text-red-700">
          Supprimer la formation
        </button>
      </form>

      <h2 className="mt-14 font-display text-sm uppercase tracking-[0.12em]">
        Leçons (espace élève)
      </h2>
      <ul className="mt-4 flex flex-col gap-3">
        {formation.lecons.map((lecon) => (
          <li key={lecon.id} className="flex items-center justify-between gap-4 border border-[var(--ligne)] bg-white p-4 text-sm">
            <div>
              <Link
                href={`/admin/formations/${id}/lecons/${lecon.id}`}
                className="font-medium hover:text-[var(--brass)]"
              >
                {lecon.ordre}. {lecon.titre}
              </Link>
              <p className="text-xs text-[var(--gris)]">
                {lecon.videoFichier ? "Vidéo hébergée · " : lecon.videoUrl ? "Vidéo (lien) · " : ""}
                {lecon.pdfUrl ? "PDF · " : ""}
                {lecon.quiz ? "Quiz" : "Sans quiz"}
              </p>
            </div>
            <form action={deleteLecon.bind(null, id, lecon.id)}>
              <button type="submit" className="text-xs uppercase tracking-[0.1em] text-red-700">
                Supprimer
              </button>
            </form>
          </li>
        ))}
        {formation.lecons.length === 0 && (
          <p className="text-sm text-[var(--gris)]">
            Aucune leçon. Les élèves inscrites ne voient rien pour l&apos;instant.
          </p>
        )}
      </ul>

      <h3 className="mt-6 text-xs uppercase tracking-[0.12em] text-[var(--gris)]">Ajouter une leçon</h3>
      <form action={createLecon.bind(null, id)} className="mt-3 flex flex-col gap-4 border border-[var(--ligne)] bg-white p-5">
        <div>
          <label className="text-xs uppercase tracking-[0.1em]" htmlFor="lecon-titre">Titre</label>
          <input id="lecon-titre" name="titre" required className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.1em]" htmlFor="lecon-contenu">Texte du cours</label>
          <textarea id="lecon-contenu" name="contenu" rows={4} placeholder="Le contenu affiché sur la page de la leçon. Un paragraphe par ligne." className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.1em]" htmlFor="lecon-video">Lien vidéo (optionnel)</label>
          <input id="lecon-video" name="videoUrl" type="url" placeholder="ex: lien YouTube non répertorié, Vimeo, ou fichier .mp4" className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.1em]" htmlFor="lecon-pdf">Support PDF (optionnel — réservé aux inscrites)</label>
          <input id="lecon-pdf" name="pdf" type="file" accept="application/pdf" className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
        </div>
        <button
          type="submit"
          className="self-start border border-[var(--noir)] px-5 py-2.5 text-xs uppercase tracking-[0.1em] hover:bg-[var(--noir)] hover:text-[var(--porcelaine)]"
        >
          Ajouter la leçon
        </button>
      </form>

      <h2 className="mt-14 font-display text-sm uppercase tracking-[0.12em]">Élèves inscrites</h2>
      {formation.sessions.length === 0 ? (
        <p className="mt-3 text-sm text-[var(--gris)]">
          Créez d&apos;abord une session pour pouvoir inscrire des élèves.
        </p>
      ) : (
        <div className="mt-4 flex flex-col gap-6">
          {formation.sessions.map((s) => (
            <div key={s.id} className="border border-[var(--ligne)] bg-white p-5">
              <p className="text-sm font-medium">
                Session du {s.dateDebut.toLocaleDateString("fr-FR")} au {s.dateFin.toLocaleDateString("fr-FR")}
              </p>
              <ul className="mt-3 flex flex-col gap-2">
                {s.inscriptions.map((insc) => {
                  const faits = terminesParEleve.get(insc.eleveId) ?? 0;
                  const total = formation.lecons.length;
                  const pct = total > 0 ? Math.round((faits / total) * 100) : 0;
                  return (
                    <li key={insc.id} className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--ligne)] pt-2 text-sm">
                      <div>
                        <p>{insc.eleve.nom}</p>
                        <p className="text-xs text-[var(--gris)]">
                          {insc.eleve.email} — {faits}/{total} leçons terminées ({pct}%)
                        </p>
                      </div>
                      {insc.certificat ? (
                        <span className="text-xs uppercase tracking-[0.1em] text-[var(--brass)]">
                          Certificat {insc.certificat.numero}
                        </span>
                      ) : (
                        <form action={validerCertificat.bind(null, id, insc.id)}>
                          <button
                            type="submit"
                            className="border border-[var(--noir)] px-4 py-2 text-xs uppercase tracking-[0.1em] hover:bg-[var(--noir)] hover:text-[var(--porcelaine)]"
                          >
                            Valider — générer le certificat
                          </button>
                        </form>
                      )}
                    </li>
                  );
                })}
                {s.inscriptions.length === 0 && (
                  <li className="border-t border-[var(--ligne)] pt-2 text-sm text-[var(--gris)]">
                    Aucune élève inscrite.
                  </li>
                )}
              </ul>
              <form action={inscrireEleve.bind(null, id, s.id)} className="mt-4 flex flex-wrap items-end gap-3">
                <div className="grow">
                  <label className="text-xs uppercase tracking-[0.1em]" htmlFor={`email-${s.id}`}>
                    Inscrire une élève (email de son compte)
                  </label>
                  <input id={`email-${s.id}`} name="email" type="email" required placeholder="eleve@email.com" className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
                </div>
                <button
                  type="submit"
                  className="border border-[var(--noir)] px-4 py-2.5 text-xs uppercase tracking-[0.1em] hover:bg-[var(--noir)] hover:text-[var(--porcelaine)]"
                >
                  Inscrire
                </button>
              </form>
            </div>
          ))}
        </div>
      )}

      <h2 className="mt-14 font-display text-sm uppercase tracking-[0.12em]">Sessions</h2>
      <ul className="mt-4 flex flex-col gap-3">
        {formation.sessions.map((s) => (
          <li key={s.id} className="flex items-center justify-between border border-[var(--ligne)] bg-white p-4 text-sm">
            <div>
              <p>
                {s.dateDebut.toLocaleDateString("fr-FR")} &rarr; {s.dateFin.toLocaleDateString("fr-FR")}
              </p>
              <p className="text-[var(--gris)]">{s.placesRestantes} / {s.placesMax} places restantes</p>
            </div>
            <form action={deleteFormationSession.bind(null, id, s.id)}>
              <button type="submit" className="text-xs uppercase tracking-[0.1em] text-red-700">
                Supprimer
              </button>
            </form>
          </li>
        ))}
        {formation.sessions.length === 0 && (
          <p className="text-sm text-[var(--gris)]">Aucune session programmée.</p>
        )}
      </ul>

      <form action={createFormationSession.bind(null, id)} className="mt-6 flex flex-wrap items-end gap-4">
        <div>
          <label className="text-xs uppercase tracking-[0.1em]" htmlFor="dateDebut">Début</label>
          <input id="dateDebut" name="dateDebut" type="date" required className="mt-1 border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.1em]" htmlFor="dateFin">Fin</label>
          <input id="dateFin" name="dateFin" type="date" required className="mt-1 border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.1em]" htmlFor="placesMax">Places</label>
          <input id="placesMax" name="placesMax" type="number" min={1} required defaultValue={10} className="mt-1 w-24 border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
        </div>
        <button
          type="submit"
          className="border border-[var(--noir)] px-5 py-2.5 text-xs uppercase tracking-[0.1em] hover:bg-[var(--noir)] hover:text-[var(--porcelaine)]"
        >
          Ajouter la session
        </button>
      </form>
    </section>
  );
}
