import Link from "next/link";
import { prisma } from "@/lib/db";

export const metadata = { title: "Academy — Radia Glam" };

export default async function AcademyPage() {
  const formations = await prisma.formation.findMany({
    where: { publie: true },
    include: { _count: { select: { lecons: true } } },
    orderBy: [{ ordreAffichage: "asc" }, { createdAt: "desc" }],
  });

  return (
    <section className="mx-auto max-w-5xl px-6 py-20">
      <h1 className="font-display text-2xl uppercase tracking-[0.12em]">Radia Glam Academy</h1>
      <p className="mt-4 text-[var(--gris)]">
        Intensive, Intermediaire, Debutant, Automaquillage, Masterclass.
      </p>

      {formations.length === 0 ? (
        <p className="mt-10 text-sm text-[var(--gris)]">
          Aucune formation publiee pour le moment. Ajoutez-en depuis le tableau de bord admin.
        </p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {formations.map((formation) => {
            const enLigne = formation.mode === "EN_LIGNE";
            const nbModules = formation._count.lecons;
            const meta: string[] = [];
            if (nbModules > 0) meta.push(`${nbModules} module${nbModules > 1 ? "s" : ""}`);
            if (formation.dureeVideo) meta.push(formation.dureeVideo);
            meta.push(enLigne ? "Accès immédiat" : "En présentiel");

            return (
              <Link
                key={formation.id}
                href={`/academy/${formation.id}`}
                className="group flex flex-col border border-[var(--noir)] bg-white transition hover:shadow-lg"
              >
                {formation.photos[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={formation.photos[0]} alt={formation.titre} className="h-48 w-full object-cover" />
                ) : (
                  <div className="flex h-48 items-center justify-center bg-gradient-to-br from-[var(--blush)] to-[#c9a98f] text-sm italic text-[var(--noir)]/50">
                    Photo a venir
                  </div>
                )}
                <div className="flex flex-1 flex-col p-6">
                  <h2 className="font-display text-sm uppercase tracking-[0.1em] group-hover:text-[var(--brass)]">
                    {formation.titre}
                  </h2>
                  <p className="mt-2 flex-1 text-sm text-[var(--gris)]">{formation.description}</p>
                  <p className="mt-4 text-xs uppercase tracking-[0.1em] text-[var(--brass)]">
                    {meta.join(" • ")}
                  </p>
                  <p className="mt-2 font-display text-sm">
                    {formation.tarifFcfa.toLocaleString("fr-FR")} FCFA
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
