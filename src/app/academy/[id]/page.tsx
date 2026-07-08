import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";

function paragraphes(texte: string) {
  return texte
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const formation = await prisma.formation.findUnique({ where: { id }, select: { titre: true, publie: true } });
  if (!formation || !formation.publie) return { title: "Formation — Radia Glam" };
  return { title: `${formation.titre} — Radia Glam Academy` };
}

export default async function FormationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const formation = await prisma.formation.findUnique({
    where: { id },
    include: { sessions: { orderBy: { dateDebut: "asc" } } },
  });
  if (!formation || !formation.publie) notFound();

  const sessionsAVenir = formation.sessions.filter((s) => s.dateFin >= new Date());

  return (
    <article>
      {formation.photos[0] && (
        <div className="h-64 w-full overflow-hidden sm:h-80">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={formation.photos[0]} alt={formation.titre} className="h-full w-full object-cover" />
        </div>
      )}

      <section className="mx-auto max-w-4xl px-6 py-16">
        <p className="text-xs uppercase tracking-[0.1em] text-[var(--brass)]">
          <Link href="/academy">&larr; Toutes les formations</Link>
        </p>
        <h1 className="font-display mt-3 text-2xl uppercase tracking-[0.12em] sm:text-3xl">
          {formation.titre}
        </h1>
        <p className="mt-3 text-[var(--gris)]">{formation.description}</p>

        <div className="mt-10 grid gap-10 md:grid-cols-[1fr_280px]">
          <div>
            {formation.presentation && (
              <div>
                <h2 className="font-display text-sm uppercase tracking-[0.12em]">Présentation</h2>
                <div className="mt-3 flex flex-col gap-3 text-sm leading-relaxed text-[var(--gris)]">
                  {paragraphes(formation.presentation).map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </div>
            )}

            <div className={formation.presentation ? "mt-10" : ""}>
              <h2 className="font-display text-sm uppercase tracking-[0.12em]">Programme</h2>
              <ul className="mt-3 flex flex-col gap-2 text-sm leading-relaxed text-[var(--gris)]">
                {paragraphes(formation.programme).map((p, i) => (
                  <li key={i} className="flex gap-3">
                    <span aria-hidden className="text-[var(--brass)]">—</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            {formation.modalitesAcces && (
              <div className="mt-10">
                <h2 className="font-display text-sm uppercase tracking-[0.12em]">
                  Modalités d&apos;accès
                </h2>
                <div className="mt-3 flex flex-col gap-3 text-sm leading-relaxed text-[var(--gris)]">
                  {paragraphes(formation.modalitesAcces).map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </div>
            )}

            {formation.prerequis && (
              <div className="mt-10">
                <h2 className="font-display text-sm uppercase tracking-[0.12em]">Prérequis</h2>
                <div className="mt-3 flex flex-col gap-3 text-sm leading-relaxed text-[var(--gris)]">
                  {paragraphes(formation.prerequis).map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="h-fit border border-[var(--noir)] bg-white p-6">
            <h2 className="font-display text-sm uppercase tracking-[0.12em]">Infos pratiques</h2>
            <dl className="mt-4 flex flex-col gap-3 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-[0.1em] text-[var(--gris)]">Tarif</dt>
                <dd className="font-italic-serif mt-0.5 text-lg text-[var(--brass)]">
                  {formation.tarifFcfa.toLocaleString("fr-FR")} FCFA
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.1em] text-[var(--gris)]">Durée</dt>
                <dd className="mt-0.5">{formation.duree}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.1em] text-[var(--gris)]">Niveau</dt>
                <dd className="mt-0.5">{formation.niveau}</dd>
              </div>
            </dl>

            <h3 className="mt-6 text-xs uppercase tracking-[0.1em] text-[var(--gris)]">
              Prochaines sessions
            </h3>
            {sessionsAVenir.length === 0 ? (
              <p className="mt-2 text-sm text-[var(--gris)]">
                Aucune session programmée pour le moment. Contactez le salon pour être informée des
                prochaines dates.
              </p>
            ) : (
              <ul className="mt-2 flex flex-col gap-2 text-sm">
                {sessionsAVenir.map((s) => (
                  <li key={s.id} className="border border-[var(--ligne)] px-3 py-2">
                    <p>
                      {s.dateDebut.toLocaleDateString("fr-FR")} &rarr;{" "}
                      {s.dateFin.toLocaleDateString("fr-FR")}
                    </p>
                    <p className="text-xs text-[var(--gris)]">
                      {s.placesRestantes > 0
                        ? `${s.placesRestantes} place(s) restante(s)`
                        : "Complet — liste d'attente"}
                    </p>
                  </li>
                ))}
              </ul>
            )}

            <Link
              href="/contact"
              className="mt-6 block border border-[var(--noir)] bg-[var(--noir)] px-4 py-3 text-center text-xs uppercase tracking-[0.12em] text-[var(--porcelaine)] hover:bg-transparent hover:text-[var(--noir)]"
            >
              Réserver sa place
            </Link>
          </aside>
        </div>
      </section>
    </article>
  );
}
