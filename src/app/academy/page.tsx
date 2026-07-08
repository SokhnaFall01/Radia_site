import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSiteTextes } from "@/lib/contenuTextes";

export const metadata = { title: "Academy — Radia Glam" };

export default async function AcademyPage() {
  const [t, formations] = await Promise.all([
    getSiteTextes(),
    prisma.formation.findMany({
      where: { publie: true },
      include: { sessions: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <section className="mx-auto max-w-5xl px-6 py-20">
      <h1 className="font-display text-2xl uppercase tracking-[0.12em]">{t.academyTitre}</h1>
      <p className="mt-4 text-[var(--gris)]">{t.academyIntro}</p>

      {formations.length === 0 ? (
        <p className="mt-10 text-sm text-[var(--gris)]">
          Aucune formation publiée pour le moment. Ajoutez-en depuis le tableau de bord admin.
        </p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {formations.map((formation) => (
            <Link
              key={formation.id}
              href={`/academy/${formation.id}`}
              className="group border border-[var(--noir)] bg-white transition-shadow hover:shadow-lg"
            >
              {formation.photos[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={formation.photos[0]} alt={formation.titre} className="h-48 w-full object-cover" />
              ) : (
                <div className="flex h-48 items-center justify-center bg-gradient-to-br from-[var(--blush)] to-[#c9a98f] text-sm italic text-[var(--noir)]/50">
                  Photo à venir
                </div>
              )}
              <div className="p-6">
                <h2 className="font-display text-sm uppercase tracking-[0.1em] group-hover:text-[var(--brass)]">
                  {formation.titre}
                </h2>
                <p className="mt-2 text-sm text-[var(--gris)]">{formation.description}</p>
                <p className="mt-4 text-sm">
                  {formation.tarifFcfa.toLocaleString("fr-FR")} FCFA — {formation.duree}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.1em] text-[var(--brass)]">
                  {formation.sessions.length} session(s) programmée(s)
                </p>
                <p className="mt-4 text-xs uppercase tracking-[0.12em] underline decoration-[var(--brass)] underline-offset-4">
                  Découvrir la formation
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
