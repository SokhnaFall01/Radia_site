import Link from "next/link";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/db";

export const metadata = { title: "Mon espace — Radia Glam" };

export default async function EspacePage({
  searchParams,
}: {
  searchParams: Promise<{ reservation?: string }>;
}) {
  const session = await verifySession();
  if (!session) redirect("/connexion");
  const { reservation } = await searchParams;

  const [user, inscriptions, progressions, rendezVous] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.userId } }),
    prisma.inscription.findMany({
      where: { eleveId: session.userId, statut: { in: ["CONFIRMEE", "EN_ATTENTE_PAIEMENT"] } },
      include: { formation: { include: { lecons: { select: { id: true } } } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.progression.findMany({
      where: { eleveId: session.userId, terminee: true },
      select: { leconId: true },
    }),
    prisma.rendezVous.findMany({
      where: { clienteId: session.userId },
      include: { prestation: true, maquilleuse: true },
      orderBy: { date: "desc" },
      take: 5,
    }),
  ]);

  const doneLeconIds = new Set(progressions.map((p) => p.leconId));

  return (
    <section className="mx-auto max-w-4xl px-6 py-20">
      <p className="text-xs uppercase tracking-[0.2em] text-[var(--brass)]">Radia Glam Academy</p>
      <h1 className="font-display mt-3 text-2xl uppercase tracking-[0.12em]">
        Bienvenue{user?.nom ? `, ${user.nom}` : ""} 👋
      </h1>
      <p className="mt-2 text-sm text-[var(--gris)]">Bienvenue dans votre espace Radiaglam.</p>

      {reservation === "confirmee" && (
        <p className="mt-6 border border-[var(--brass)] bg-[var(--blush)] px-4 py-3 text-sm">
          Votre demande de rendez-vous a bien ete enregistree.
        </p>
      )}

      {/* Mes formations */}
      <h2 className="mt-12 font-display text-sm uppercase tracking-[0.12em]">Mes formations</h2>
      {inscriptions.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--gris)]">
          Vous n&apos;avez pas encore de formation.{" "}
          <Link href="/academy" className="underline">
            Decouvrir le catalogue
          </Link>
          .
        </p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {inscriptions.map((inscription) => {
            const formation = inscription.formation;
            const enAttente = inscription.statut === "EN_ATTENTE_PAIEMENT";
            const total = formation.lecons.length;
            const done = formation.lecons.filter((l) => doneLeconIds.has(l.id)).length;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            const demarree = done > 0;

            return (
              <div key={inscription.id} className="flex flex-col border border-[var(--noir)] bg-white p-5">
                <h3 className="font-display text-sm uppercase tracking-[0.1em]">{formation.titre}</h3>

                {enAttente ? (
                  <>
                    <p className="mt-3 flex-1 text-xs uppercase tracking-[0.1em] text-[var(--brass)]">
                      En attente de validation du paiement
                    </p>
                    <Link
                      href={`/academy/${formation.id}/acheter`}
                      className="mt-4 border border-[var(--noir)] px-4 py-2.5 text-center text-xs uppercase tracking-[0.1em] hover:bg-[var(--blush)]"
                    >
                      Voir les instructions de paiement
                    </Link>
                  </>
                ) : (
                  <>
                    <div className="mt-4 h-1.5 w-full bg-[var(--blush)]">
                      <div className="h-1.5 bg-[var(--brass)]" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="mt-2 flex-1 text-xs uppercase tracking-[0.1em] text-[var(--gris)]">
                      Progression : {pct}%
                    </p>
                    <Link
                      href={`/espace/formations/${formation.id}`}
                      className="mt-4 border border-[var(--noir)] bg-[var(--noir)] px-4 py-2.5 text-center text-xs uppercase tracking-[0.1em] text-[var(--porcelaine)] hover:bg-[var(--brass)] hover:text-[var(--noir)]"
                    >
                      {demarree ? "Continuer la formation" : "Commencer la formation"}
                    </Link>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-4 text-xs uppercase tracking-[0.1em]">
        <Link href="/espace/formations" className="border border-[var(--noir)] px-4 py-2 hover:bg-[var(--noir)] hover:text-[var(--porcelaine)]">
          Toutes mes formations
        </Link>
        <Link href="/espace/commandes" className="border border-[var(--noir)] px-4 py-2 hover:bg-[var(--noir)] hover:text-[var(--porcelaine)]">
          Mes commandes
        </Link>
        <Link href="/academy" className="border border-[var(--noir)] px-4 py-2 hover:bg-[var(--noir)] hover:text-[var(--porcelaine)]">
          Catalogue Academy
        </Link>
      </div>

      {/* Rendez-vous */}
      <h2 className="mt-14 font-display text-sm uppercase tracking-[0.12em]">Mes rendez-vous</h2>
      {rendezVous.length === 0 ? (
        <p className="mt-3 text-sm text-[var(--gris)]">Aucun rendez-vous pour le moment.</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {rendezVous.map((rdv) => (
            <li key={rdv.id} className="border border-[var(--ligne)] bg-white p-4 text-sm">
              <p className="font-medium">{rdv.prestation.nom}</p>
              <p className="text-[var(--gris)]">
                {rdv.date.toLocaleString("fr-FR", { timeZone: "UTC" })}
                {rdv.maquilleuse ? ` — avec ${rdv.maquilleuse.nom}` : ""}
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.1em] text-[var(--brass)]">{rdv.statut}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
