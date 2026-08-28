import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const formation = await prisma.formation.findUnique({ where: { id } });
  if (!formation) return { title: "Formation — Radia Glam Academy" };
  return { title: `${formation.titre} — Radia Glam Academy` };
}

function CategorieLabel({ categorie }: { categorie: string }) {
  const map: Record<string, string> = {
    MAQUILLAGE: "Maquillage",
    PERFECTIONNEMENT: "Perfectionnement",
    BUSINESS: "Business",
    MASTERCLASS: "Masterclass",
  };
  return <>{map[categorie] ?? categorie}</>;
}

export default async function FormationVentePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const formation = await prisma.formation.findUnique({
    where: { id },
    include: {
      lecons: { orderBy: { ordre: "asc" } },
      sessions: { where: { dateDebut: { gte: new Date() } }, orderBy: { dateDebut: "asc" } },
    },
  });

  if (!formation || !formation.publie) notFound();

  const enLigne = formation.mode === "EN_LIGNE";
  const nbModules = formation.lecons.length;
  const prix = formation.tarifFcfa.toLocaleString("fr-FR");

  const metaParts: string[] = [];
  if (nbModules > 0) metaParts.push(`${nbModules} module${nbModules > 1 ? "s" : ""}`);
  if (formation.dureeVideo) metaParts.push(formation.dureeVideo);
  else if (!enLigne && formation.duree) metaParts.push(formation.duree);
  if (enLigne) metaParts.push("Accès immédiat");

  return (
    <article className="pb-24">
      {/* Hero */}
      <section className="bg-[var(--noir)] text-[var(--porcelaine)]">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--brass)]">
            Radia Glam Academy · <CategorieLabel categorie={formation.categorie} />
          </p>
          <h1 className="font-display mt-4 text-3xl uppercase leading-tight tracking-[0.1em] sm:text-4xl">
            {formation.titre}
          </h1>
          {formation.promesse && (
            <p className="mt-5 max-w-2xl text-lg text-[var(--porcelaine)]/80">{formation.promesse}</p>
          )}
          {metaParts.length > 0 && (
            <p className="mt-6 text-sm uppercase tracking-[0.12em] text-[var(--porcelaine)]/70">
              {metaParts.join(" • ")}
            </p>
          )}
          <div className="mt-8 flex flex-wrap items-center gap-6">
            <span className="font-display text-2xl">{prix} FCFA</span>
            {enLigne ? (
              <Link
                href={`/academy/${formation.id}/acheter`}
                className="border border-[var(--brass)] bg-[var(--brass)] px-8 py-4 text-xs uppercase tracking-[0.18em] text-[var(--noir)] hover:opacity-90"
              >
                Acheter la formation
              </Link>
            ) : (
              <Link
                href="/contact"
                className="border border-[var(--brass)] bg-[var(--brass)] px-8 py-4 text-xs uppercase tracking-[0.18em] text-[var(--noir)] hover:opacity-90"
              >
                Réserver ma place
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Video / photo */}
      {(formation.videoIntroUrl || formation.photos[0]) && (
        <section className="mx-auto max-w-4xl px-6 py-12">
          {formation.videoIntroUrl ? (
            <video
              controls
              src={formation.videoIntroUrl}
              poster={formation.photos[0] ?? undefined}
              className="w-full border border-[var(--noir)] bg-black"
            >
              <track kind="captions" />
            </video>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={formation.photos[0]}
              alt={formation.titre}
              className="w-full border border-[var(--noir)] object-cover"
            />
          )}
        </section>
      )}

      <div className="mx-auto max-w-3xl px-6">
        <p className="mt-4 text-[var(--gris)]">{formation.description}</p>

        {/* Ce que vous allez apprendre */}
        {formation.objectifs.length > 0 && (
          <section className="mt-14">
            <h2 className="font-display text-lg uppercase tracking-[0.12em]">
              Ce que vous allez apprendre
            </h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {formation.objectifs.map((o, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="text-[var(--brass)]">✓</span>
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Faite pour vous si */}
        {formation.pourQui.length > 0 && (
          <section className="mt-14 border border-[var(--ligne)] bg-white p-8">
            <h2 className="font-display text-lg uppercase tracking-[0.12em]">
              Cette formation est faite pour vous si…
            </h2>
            <ul className="mt-6 flex flex-col gap-3">
              {formation.pourQui.map((p, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="text-[var(--brass)]">→</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Ce que vous recevrez */}
        {formation.inclus.length > 0 && (
          <section className="mt-14">
            <h2 className="font-display text-lg uppercase tracking-[0.12em]">Ce que vous recevrez</h2>
            <ul className="mt-6 flex flex-col gap-3">
              {formation.inclus.map((item, i) => (
                <li key={i} className="border-b border-[var(--ligne)] pb-3 text-sm">
                  {item}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Programme / modules */}
        {nbModules > 0 && (
          <section className="mt-14">
            <h2 className="font-display text-lg uppercase tracking-[0.12em]">Le programme</h2>
            <ol className="mt-6 flex flex-col gap-2">
              {formation.lecons.map((lecon, i) => (
                <li
                  key={lecon.id}
                  className="flex items-center gap-4 border border-[var(--ligne)] bg-white px-5 py-3 text-sm"
                >
                  <span className="font-display text-[var(--brass)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{lecon.titre}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Sessions presentiel */}
        {!enLigne && (
          <section className="mt-14">
            <h2 className="font-display text-lg uppercase tracking-[0.12em]">Prochaines sessions</h2>
            {formation.sessions.length === 0 ? (
              <p className="mt-4 text-sm text-[var(--gris)]">
                Aucune date programmée pour le moment. Contactez-nous pour être informée.
              </p>
            ) : (
              <ul className="mt-6 flex flex-col gap-3">
                {formation.sessions.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between border border-[var(--ligne)] bg-white p-4 text-sm"
                  >
                    <span>
                      {s.dateDebut.toLocaleDateString("fr-FR")} &rarr;{" "}
                      {s.dateFin.toLocaleDateString("fr-FR")}
                    </span>
                    <span className="text-xs uppercase tracking-[0.1em] text-[var(--brass)]">
                      {s.placesRestantes} place(s)
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {/* CTA final */}
        <section className="mt-16 border-t border-[var(--ligne)] pt-10 text-center">
          <p className="font-display text-2xl">{prix} FCFA</p>
          {enLigne ? (
            <Link
              href={`/academy/${formation.id}/acheter`}
              className="mt-6 inline-block border border-[var(--noir)] bg-[var(--noir)] px-10 py-4 text-xs uppercase tracking-[0.18em] text-[var(--porcelaine)] hover:bg-[var(--brass)] hover:text-[var(--noir)]"
            >
              Je commence ma formation
            </Link>
          ) : (
            <Link
              href="/contact"
              className="mt-6 inline-block border border-[var(--noir)] bg-[var(--noir)] px-10 py-4 text-xs uppercase tracking-[0.18em] text-[var(--porcelaine)] hover:bg-[var(--brass)] hover:text-[var(--noir)]"
            >
              Réserver ma place
            </Link>
          )}
          <p className="mt-4 text-xs uppercase tracking-[0.1em] text-[var(--gris)]">
            <Link href="/academy" className="underline">
              &larr; Retour aux formations
            </Link>
          </p>
        </section>
      </div>
    </article>
  );
}
