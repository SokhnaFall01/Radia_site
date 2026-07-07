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

  const [user, rendezVous] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.userId } }),
    prisma.rendezVous.findMany({
      where: { clienteId: session.userId },
      include: { prestation: true, maquilleuse: true },
      orderBy: { date: "desc" },
    }),
  ]);

  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="font-display text-2xl uppercase tracking-[0.12em]">
        Bonjour {user?.nom}
      </h1>

      {reservation === "confirmee" && (
        <p className="mt-4 border border-[var(--brass)] bg-[var(--blush)] px-4 py-3 text-sm">
          Votre demande de rendez-vous a bien ete enregistree.
        </p>
      )}

      <h2 className="mt-10 font-display text-sm uppercase tracking-[0.12em]">Mes rendez-vous</h2>
      {rendezVous.length === 0 ? (
        <p className="mt-3 text-sm text-[var(--gris)]">Aucun rendez-vous pour le moment.</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {rendezVous.map((rdv) => (
            <li key={rdv.id} className="border border-[var(--ligne)] bg-white p-4 text-sm">
              <p className="font-medium">{rdv.prestation.nom}</p>
              <p className="text-[var(--gris)]">
                {rdv.date.toLocaleString("fr-FR")}
                {rdv.maquilleuse ? ` — avec ${rdv.maquilleuse.nom}` : ""}
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.1em] text-[var(--brass)]">
                {rdv.statut}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
