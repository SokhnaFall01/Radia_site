import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/db";

export default async function FormationEspacePage({
  params,
}: {
  params: Promise<{ formationId: string }>;
}) {
  const session = await verifySession();
  if (!session) redirect("/connexion");
  const { formationId } = await params;

  const inscription = await prisma.inscription.findFirst({
    where: { eleveId: session.userId, statut: "CONFIRMEE", session: { formationId } },
    include: { session: { include: { formation: true } } },
  });
  if (!inscription) notFound();

  const formation = inscription.session.formation;
  const lecons = await prisma.lecon.findMany({
    where: { formationId },
    orderBy: { ordre: "asc" },
  });

  const progressions = await prisma.progression.findMany({
    where: { eleveId: session.userId, leconId: { in: lecons.map((l) => l.id) } },
  });
  const progressionByLecon = new Map(progressions.map((p) => [p.leconId, p]));

  const certificat = await prisma.certificat.findUnique({ where: { inscriptionId: inscription.id } });

  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <p className="text-xs uppercase tracking-[0.1em] text-[var(--brass)]">
        <Link href="/espace/formations">&larr; Mes formations</Link>
      </p>
      <h1 className="font-display mt-3 text-2xl uppercase tracking-[0.12em]">{formation.titre}</h1>

      {certificat ? (
        <a
          href={`/api/certificats/${certificat.id}`}
          className="mt-6 inline-block border border-[var(--brass)] bg-[var(--blush)] px-5 py-3 text-xs uppercase tracking-[0.1em]"
        >
          Télécharger mon certificat ({certificat.numero})
        </a>
      ) : (
        lecons.length > 0 &&
        lecons.every((l) => progressionByLecon.get(l.id)?.terminee) && (
          <p className="mt-6 border border-[var(--brass)] bg-[var(--blush)] px-4 py-3 text-sm">
            Félicitations, toutes les leçons sont terminées ! Votre certificat sera disponible ici
            dès validation par la formatrice.
          </p>
        )
      )}

      <ul className="mt-8 flex flex-col gap-3">
        {lecons.map((lecon) => {
          const p = progressionByLecon.get(lecon.id);
          return (
            <li key={lecon.id}>
              <Link
                href={`/espace/formations/${formationId}/lecons/${lecon.id}`}
                className="flex items-center justify-between border border-[var(--ligne)] bg-white px-5 py-4 text-sm hover:border-[var(--noir)]"
              >
                <span>{lecon.titre}</span>
                <span className="text-xs uppercase tracking-[0.1em] text-[var(--brass)]">
                  {p?.terminee ? "Terminé" : "À faire"}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
