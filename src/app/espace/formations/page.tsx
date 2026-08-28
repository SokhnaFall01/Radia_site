import Link from "next/link";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/db";

export const metadata = { title: "Mes formations — Radia Glam" };

export default async function MesFormationsPage() {
  const session = await verifySession();
  if (!session) redirect("/connexion");

  const inscriptions = await prisma.inscription.findMany({
    where: { eleveId: session.userId, statut: "CONFIRMEE" },
    include: { formation: { include: { lecons: true } } },
  });

  const progressions = await prisma.progression.findMany({
    where: { eleveId: session.userId, terminee: true },
    select: { leconId: true },
  });
  const doneLeconIds = new Set(progressions.map((p) => p.leconId));

  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="font-display text-2xl uppercase tracking-[0.12em]">Mes formations</h1>

      {inscriptions.length === 0 ? (
        <p className="mt-6 text-sm text-[var(--gris)]">
          Vous n&apos;etes inscrite a aucune formation pour le moment.{" "}
          <Link href="/academy" className="underline">
            Voir le catalogue
          </Link>
          .
        </p>
      ) : (
        <ul className="mt-8 flex flex-col gap-4">
          {inscriptions.map((inscription) => {
            const formation = inscription.formation;
            const total = formation.lecons.length;
            const done = formation.lecons.filter((l) => doneLeconIds.has(l.id)).length;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;

            return (
              <li key={inscription.id} className="border border-[var(--noir)] bg-white p-5">
                <Link
                  href={`/espace/formations/${formation.id}`}
                  className="font-display text-sm uppercase tracking-[0.1em] hover:text-[var(--brass)]"
                >
                  {formation.titre}
                </Link>
                <div className="mt-3 h-1.5 w-full bg-[var(--blush)]">
                  <div className="h-1.5 bg-[var(--brass)]" style={{ width: `${pct}%` }} />
                </div>
                <p className="mt-2 text-xs uppercase tracking-[0.1em] text-[var(--gris)]">
                  {done} / {total} lecons terminees ({pct}%)
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
