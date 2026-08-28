import Link from "next/link";
import { prisma } from "@/lib/db";

export const metadata = { title: "Formations en presentiel — Radia Glam Academy" };

export default async function AcademyPresentielPage() {
  const formations = await prisma.formation.findMany({
    where: { publie: true, mode: "PRESENTIEL" },
    include: {
      sessions: { where: { dateDebut: { gte: new Date() } }, orderBy: { dateDebut: "asc" } },
    },
    orderBy: [{ ordreAffichage: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="pb-24">
      <section className="bg-[var(--noir)] text-[var(--porcelaine)]">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--brass)]">Radia Glam Academy</p>
          <h1 className="font-display mt-4 text-3xl uppercase tracking-[0.14em]">
            Formations en presentiel
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-[var(--porcelaine)]/80">
            Venez apprendre avec Radia, en petit groupe, dans notre espace a Dakar.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-6">
        {formations.length === 0 ? (
          <p className="mt-16 text-center text-sm text-[var(--gris)]">
            Aucune formation en presentiel programmee pour le moment.{" "}
            <Link href="/contact" className="underline">
              Contactez-nous
            </Link>{" "}
            pour etre informee.
          </p>
        ) : (
          <div className="mt-12 flex flex-col gap-6">
            {formations.map((f) => (
              <Link
                key={f.id}
                href={`/academy/${f.id}`}
                className="group flex flex-col gap-4 border border-[var(--noir)] bg-white p-6 transition hover:shadow-lg sm:flex-row"
              >
                {f.photos[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={f.photos[0]} alt={f.titre} className="h-40 w-full object-cover sm:w-56" />
                ) : (
                  <div className="flex h-40 w-full items-center justify-center bg-gradient-to-br from-[var(--blush)] to-[#c9a98f] text-sm italic text-[var(--noir)]/50 sm:w-56">
                    Photo a venir
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="font-display text-sm uppercase tracking-[0.1em] group-hover:text-[var(--brass)]">
                    {f.titre}
                  </h2>
                  <p className="mt-2 text-sm text-[var(--gris)]">{f.description}</p>
                  <p className="mt-3 font-display text-sm">
                    {f.tarifFcfa.toLocaleString("fr-FR")} FCFA · {f.duree}
                  </p>
                  <p className="mt-2 text-xs uppercase tracking-[0.1em] text-[var(--brass)]">
                    {f.sessions.length > 0
                      ? `Prochaine session : ${f.sessions[0].dateDebut.toLocaleDateString("fr-FR")}`
                      : "Dates a venir"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
