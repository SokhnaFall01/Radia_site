import { redirect } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/db";

export const metadata = { title: "Mes commandes — Radia Glam" };

const STATUT_LABEL: Record<string, string> = {
  EN_ATTENTE: "En attente",
  PAYEE: "Payee",
  PREPAREE: "Preparee",
  LIVREE: "Livree",
  ANNULEE: "Annulee",
};

export default async function CommandesPage({
  searchParams,
}: {
  searchParams: Promise<{ commande?: string }>;
}) {
  const session = await verifySession();
  if (!session) redirect("/connexion");
  const { commande } = await searchParams;

  const commandes = await prisma.commande.findMany({
    where: { clienteId: session.userId },
    include: { lignes: { include: { produit: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="font-display text-2xl uppercase tracking-[0.12em]">Mes commandes</h1>

      {commande === "confirmee" && (
        <p className="mt-4 border border-[var(--brass)] bg-[var(--blush)] px-4 py-3 text-sm">
          Votre commande a bien ete enregistree.
        </p>
      )}

      {commandes.length === 0 ? (
        <p className="mt-6 text-sm text-[var(--gris)]">Aucune commande pour le moment.</p>
      ) : (
        <ul className="mt-8 flex flex-col gap-4">
          {commandes.map((c) => (
            <li key={c.id} className="border border-[var(--noir)] bg-white p-5 text-sm">
              <div className="flex items-center justify-between">
                <p className="font-medium">{c.createdAt.toLocaleDateString("fr-FR")}</p>
                <span className="text-xs uppercase tracking-[0.1em] text-[var(--brass)]">
                  {STATUT_LABEL[c.statut] ?? c.statut}
                </span>
              </div>
              <ul className="mt-3 flex flex-col gap-1 text-[var(--gris)]">
                {c.lignes.map((ligne) => (
                  <li key={ligne.id}>
                    {ligne.produit.nom} x {ligne.quantite}
                  </li>
                ))}
              </ul>
              <p className="mt-3">
                {c.livraison === "LIVRAISON" ? `Livraison — ${c.adresse}` : "Retrait au salon"}
              </p>
              <p className="mt-1 font-medium">Total : {c.totalFcfa.toLocaleString("fr-FR")} FCFA</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
