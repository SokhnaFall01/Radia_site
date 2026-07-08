import Link from "next/link";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/db";

export const metadata = { title: "Statistiques — Administration" };

const STATUT_RDV_LABEL: Record<string, string> = {
  EN_ATTENTE: "En attente",
  CONFIRME: "Confirme",
  HONORE: "Honoré",
  ABSENT: "Absent",
  ANNULE: "Annulé",
};

export default async function AdminStatistiquesPage() {
  const session = await verifySession();
  if (!session) redirect("/connexion");
  if (session.role !== "ADMIN") redirect("/admin");

  const [
    commandeAgg,
    produitsVenduAgg,
    meilleuresVentesRaw,
    rdvParStatutRaw,
    rdvParMaquilleuseRaw,
    inscriptionsCount,
    rdvNonAnnules,
    staffUsers,
  ] = await Promise.all([
    prisma.commande.aggregate({ _sum: { totalFcfa: true }, _count: true, where: { statut: { not: "ANNULEE" } } }),
    prisma.ligneCommande.aggregate({ _sum: { quantite: true } }),
    prisma.ligneCommande.groupBy({
      by: ["produitId"],
      _sum: { quantite: true },
      orderBy: { _sum: { quantite: "desc" } },
      take: 5,
    }),
    prisma.rendezVous.groupBy({ by: ["statut"], _count: true }),
    prisma.rendezVous.groupBy({
      by: ["maquilleuseId"],
      _count: true,
      where: { maquilleuseId: { not: null } },
    }),
    prisma.inscription.count({ where: { statut: "CONFIRMEE" } }),
    prisma.rendezVous.findMany({
      where: { statut: { not: "ANNULE" } },
      include: { prestation: { select: { prixFcfa: true } } },
    }),
    prisma.user.findMany({ where: { role: "STAFF" }, select: { id: true, nom: true } }),
  ]);

  const produitIds = meilleuresVentesRaw.map((v) => v.produitId);
  const produits = await prisma.produit.findMany({ where: { id: { in: produitIds } } });
  const produitById = new Map(produits.map((p) => [p.id, p]));

  const staffById = new Map(staffUsers.map((s) => [s.id, s.nom]));

  const caBoutique = commandeAgg._sum.totalFcfa ?? 0;
  const caSalon = rdvNonAnnules.reduce((sum, rdv) => sum + rdv.prestation.prixFcfa, 0);
  const produitsVendus = produitsVenduAgg._sum.quantite ?? 0;

  return (
    <section className="mx-auto max-w-4xl px-6 py-20">
      <p className="text-xs uppercase tracking-[0.1em] text-[var(--brass)]">
        <Link href="/admin">&larr; Tableau de bord</Link>
      </p>
      <h1 className="font-display mt-3 text-2xl uppercase tracking-[0.12em]">Statistiques</h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="border border-[var(--noir)] bg-white p-5">
          <p className="text-xs uppercase tracking-[0.1em] text-[var(--gris)]">CA Boutique</p>
          <p className="font-display mt-2 text-2xl">{caBoutique.toLocaleString("fr-FR")} FCFA</p>
          <p className="mt-1 text-xs text-[var(--gris)]">{commandeAgg._count} commande(s)</p>
        </div>
        <div className="border border-[var(--noir)] bg-white p-5">
          <p className="text-xs uppercase tracking-[0.1em] text-[var(--gris)]">CA Salon (estimé)</p>
          <p className="font-display mt-2 text-2xl">{caSalon.toLocaleString("fr-FR")} FCFA</p>
          <p className="mt-1 text-xs text-[var(--gris)]">{rdvNonAnnules.length} rendez-vous</p>
        </div>
        <div className="border border-[var(--noir)] bg-white p-5">
          <p className="text-xs uppercase tracking-[0.1em] text-[var(--gris)]">Produits vendus</p>
          <p className="font-display mt-2 text-2xl">{produitsVendus}</p>
          <p className="mt-1 text-xs text-[var(--gris)]">unites (toutes commandes)</p>
        </div>
        <div className="border border-[var(--noir)] bg-white p-5">
          <p className="text-xs uppercase tracking-[0.1em] text-[var(--gris)]">Inscriptions</p>
          <p className="font-display mt-2 text-2xl">{inscriptionsCount}</p>
          <p className="mt-1 text-xs text-[var(--gris)]">formations confirmees</p>
        </div>
      </div>

      <h2 className="mt-14 font-display text-sm uppercase tracking-[0.12em]">Meilleures ventes</h2>
      <ul className="mt-4 flex flex-col gap-2">
        {meilleuresVentesRaw.map((v) => {
          const produit = produitById.get(v.produitId);
          return (
            <li key={v.produitId} className="flex justify-between border border-[var(--ligne)] bg-white p-4 text-sm">
              <span>{produit?.nom ?? "Produit supprimé"}</span>
              <span className="text-[var(--brass)]">{v._sum.quantite} vendu(s)</span>
            </li>
          );
        })}
        {meilleuresVentesRaw.length === 0 && (
          <p className="text-sm text-[var(--gris)]">Aucune vente pour le moment.</p>
        )}
      </ul>

      <h2 className="mt-14 font-display text-sm uppercase tracking-[0.12em]">
        Rendez-vous par statut
      </h2>
      <ul className="mt-4 flex flex-col gap-2">
        {rdvParStatutRaw.map((r) => (
          <li key={r.statut} className="flex justify-between border border-[var(--ligne)] bg-white p-4 text-sm">
            <span>{STATUT_RDV_LABEL[r.statut] ?? r.statut}</span>
            <span className="text-[var(--brass)]">{r._count}</span>
          </li>
        ))}
        {rdvParStatutRaw.length === 0 && (
          <p className="text-sm text-[var(--gris)]">Aucun rendez-vous pour le moment.</p>
        )}
      </ul>

      <h2 className="mt-14 font-display text-sm uppercase tracking-[0.12em]">
        Prestations allouees par maquilleuse
      </h2>
      <ul className="mt-4 flex flex-col gap-2">
        {rdvParMaquilleuseRaw.map((r) => (
          <li key={r.maquilleuseId} className="flex justify-between border border-[var(--ligne)] bg-white p-4 text-sm">
            <span>{staffById.get(r.maquilleuseId!) ?? "Staff supprimé"}</span>
            <span className="text-[var(--brass)]">{r._count} rendez-vous</span>
          </li>
        ))}
        {rdvParMaquilleuseRaw.length === 0 && (
          <p className="text-sm text-[var(--gris)]">
            Aucun rendez-vous assigne a une maquilleuse en particulier.
          </p>
        )}
      </ul>
    </section>
  );
}
