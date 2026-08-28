import Link from "next/link";
import { prisma } from "@/lib/db";
import { getInfosPass } from "@/lib/contenu";

export const metadata = { title: "Radiaglam Academy Pass — All Access" };

export default async function PassPage() {
  const [pass, formations] = await Promise.all([
    getInfosPass(),
    prisma.formation.findMany({
      where: { publie: true, mode: "EN_LIGNE" },
      select: { id: true, titre: true, tarifFcfa: true },
      orderBy: [{ ordreAffichage: "asc" }, { createdAt: "desc" }],
    }),
  ]);

  const valeurTotale = formations.reduce((sum, f) => sum + f.tarifFcfa, 0);

  return (
    <div className="pb-24">
      <section className="bg-[var(--noir)] text-[var(--porcelaine)]">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <p className="text-4xl">👑</p>
          <h1 className="font-display mt-4 text-3xl uppercase tracking-[0.14em]">
            Radiaglam Academy Pass
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-[var(--porcelaine)]/80">
            {pass.description ||
              `Accedez a toutes les formations en ligne de Radia Glam Academy pendant ${pass.dureeMois} mois.`}
          </p>
          {pass.prix > 0 && (
            <p className="mt-8 font-display text-3xl">{pass.prix.toLocaleString("fr-FR")} FCFA</p>
          )}
          <Link
            href="/academy/pass/acheter"
            className="mt-8 inline-block border border-[var(--brass)] bg-[var(--brass)] px-10 py-4 text-xs uppercase tracking-[0.18em] text-[var(--noir)] hover:opacity-90"
          >
            Commencer mon parcours
          </Link>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-6">
        <section className="mt-14">
          <h2 className="font-display text-lg uppercase tracking-[0.12em]">Ce que comprend le Pass</h2>
          {formations.length === 0 ? (
            <p className="mt-4 text-sm text-[var(--gris)]">Les formations seront bientot disponibles.</p>
          ) : (
            <>
              <ul className="mt-6 flex flex-col gap-2">
                {formations.map((f) => (
                  <li
                    key={f.id}
                    className="flex items-center justify-between border border-[var(--ligne)] bg-white px-5 py-3 text-sm"
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-[var(--brass)]">✓</span>
                      {f.titre}
                    </span>
                    <span className="text-[var(--gris)]">{f.tarifFcfa.toLocaleString("fr-FR")} FCFA</span>
                  </li>
                ))}
              </ul>
              {valeurTotale > 0 && pass.prix > 0 && valeurTotale > pass.prix && (
                <p className="mt-6 border border-[var(--brass)] bg-[var(--blush)] px-4 py-3 text-sm">
                  Valeur individuelle : {valeurTotale.toLocaleString("fr-FR")} FCFA — avec le Pass,
                  tout pour {pass.prix.toLocaleString("fr-FR")} FCFA pendant {pass.dureeMois} mois.
                </p>
              )}
            </>
          )}
        </section>

        <section className="mt-14 text-center">
          <Link
            href="/academy/pass/acheter"
            className="inline-block border border-[var(--noir)] bg-[var(--noir)] px-10 py-4 text-xs uppercase tracking-[0.18em] text-[var(--porcelaine)] hover:bg-[var(--brass)] hover:text-[var(--noir)]"
          >
            J&apos;active mon Pass
          </Link>
          <p className="mt-4 text-xs uppercase tracking-[0.1em] text-[var(--gris)]">
            <Link href="/academy" className="underline">
              &larr; Retour aux formations
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
