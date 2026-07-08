import Link from "next/link";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/db";

export const metadata = { title: "Administration — Radia Glam" };

const STATUT_LABELS: Record<string, string> = {
  EN_ATTENTE: "En attente",
  CONFIRME: "Confirmé",
  HONORE: "Honoré",
  ABSENT: "Absent",
  ANNULE: "Annulé",
};

function parseDateParam(value: string | undefined) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ du?: string; au?: string }>;
}) {
  const session = await verifySession();
  if (!session) redirect("/connexion");
  if (session.role !== "ADMIN" && session.role !== "STAFF") redirect("/");

  const isStaffOnly = session.role === "STAFF";
  const { du, au } = await searchParams;

  const dateDu = parseDateParam(du);
  const dateAu = parseDateParam(au);
  const finAu = dateAu ? new Date(dateAu.getTime() + 24 * 60 * 60 * 1000 - 1) : null;
  const filtreActif = Boolean(dateDu || finAu);

  const rendezVous = await prisma.rendezVous.findMany({
    where: {
      ...(isStaffOnly ? { maquilleuseId: session.userId } : {}),
      ...(filtreActif
        ? { date: { ...(dateDu ? { gte: dateDu } : {}), ...(finAu ? { lte: finAu } : {}) } }
        : {}),
    },
    include: { prestation: true, cliente: true },
    orderBy: { date: "asc" },
    // Sans filtre on limite la liste ; une période choisie s'affiche en entier.
    ...(filtreActif ? {} : { take: 20 }),
  });

  const devisNouveaux = isStaffOnly
    ? 0
    : await prisma.demandeDevis.count({ where: { statut: "NOUVEAU" } });

  return (
    <section className="mx-auto max-w-4xl px-6 py-20">
      <h1 className="font-display text-2xl uppercase tracking-[0.12em]">
        {isStaffOnly ? "Mon agenda" : "Tableau de bord"}
      </h1>

      <h2 className="mt-10 font-display text-sm uppercase tracking-[0.12em]">
        Rendez-vous {isStaffOnly ? "" : "(tous)"}
      </h2>

      <form method="GET" className="mt-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="text-xs uppercase tracking-[0.1em]" htmlFor="du">Du</label>
          <input id="du" name="du" type="date" defaultValue={dateDu ? du : ""} className="mt-1 block border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.1em]" htmlFor="au">Au</label>
          <input id="au" name="au" type="date" defaultValue={dateAu ? au : ""} className="mt-1 block border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
        </div>
        <button
          type="submit"
          className="border border-[var(--noir)] px-4 py-2.5 text-xs uppercase tracking-[0.1em] hover:bg-[var(--noir)] hover:text-[var(--porcelaine)]"
        >
          Filtrer
        </button>
        {filtreActif && (
          <Link href="/admin" className="px-2 py-2.5 text-xs uppercase tracking-[0.1em] text-[var(--gris)] underline">
            Réinitialiser
          </Link>
        )}
      </form>
      {filtreActif && (
        <p className="mt-3 text-xs text-[var(--gris)]">
          {rendezVous.length} rendez-vous sur la période.
        </p>
      )}
      {!filtreActif && rendezVous.length === 20 && (
        <p className="mt-3 text-xs text-[var(--gris)]">
          20 premiers rendez-vous affichés — utilisez le filtre par dates pour voir une période
          précise.
        </p>
      )}

      {rendezVous.length === 0 ? (
        <p className="mt-3 text-sm text-[var(--gris)]">
          {filtreActif ? "Aucun rendez-vous sur cette période." : "Aucun rendez-vous."}
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {rendezVous.map((rdv) => (
            <li key={rdv.id} className="border border-[var(--ligne)] bg-white p-4 text-sm">
              <p className="font-medium">
                {rdv.prestation.nom} — {rdv.cliente.nom}
              </p>
              <p className="text-[var(--gris)]">{rdv.date.toLocaleString("fr-FR", { timeZone: "UTC" })}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.1em] text-[var(--brass)]">
                {STATUT_LABELS[rdv.statut] ?? rdv.statut} · {rdv.origine === "EN_LIGNE" ? "En ligne" : "Manuel"}
              </p>
            </li>
          ))}
        </ul>
      )}

      {!isStaffOnly && (
        <div className="mt-14 grid gap-4 sm:grid-cols-2">
          <Link
            href="/admin/formations"
            className="border border-[var(--noir)] bg-white p-5 text-sm hover:bg-[var(--blush)]"
          >
            Formations &amp; sessions
          </Link>
          <Link
            href="/admin/prestations"
            className="border border-[var(--noir)] bg-white p-5 text-sm hover:bg-[var(--blush)]"
          >
            Prestations (salon)
          </Link>
          <Link
            href="/admin/produits"
            className="border border-[var(--noir)] bg-white p-5 text-sm hover:bg-[var(--blush)]"
          >
            Produits &amp; stocks
          </Link>
          <Link
            href="/admin/horaires"
            className="border border-[var(--noir)] bg-white p-5 text-sm hover:bg-[var(--blush)]"
          >
            Horaires &amp; jours fériés
          </Link>
          <Link
            href="/admin/coordonnees"
            className="border border-[var(--noir)] bg-white p-5 text-sm hover:bg-[var(--blush)]"
          >
            Coordonnées &amp; réseaux
          </Link>
          <Link
            href="/admin/contenu"
            className="border border-[var(--noir)] bg-white p-5 text-sm hover:bg-[var(--blush)]"
          >
            Contenu &amp; photos du site
          </Link>
          <Link
            href="/admin/clients"
            className="border border-[var(--noir)] bg-white p-5 text-sm hover:bg-[var(--blush)]"
          >
            Clients &amp; élèves
          </Link>
          <Link
            href="/admin/statistiques"
            className="border border-[var(--noir)] bg-white p-5 text-sm hover:bg-[var(--blush)]"
          >
            Statistiques
          </Link>
          <Link
            href="/admin/devis"
            className="border border-[var(--noir)] bg-white p-5 text-sm hover:bg-[var(--blush)]"
          >
            Demandes de devis
            {devisNouveaux > 0 && (
              <span className="ml-2 bg-[var(--brass)] px-2 py-0.5 text-xs text-white">
                {devisNouveaux} nouveau{devisNouveaux > 1 ? "x" : ""}
              </span>
            )}
          </Link>
        </div>
      )}
    </section>
  );
}
