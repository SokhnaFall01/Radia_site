import Link from "next/link";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/db";
import {
  confirmerInscription,
  annulerInscription,
  confirmerPass,
  annulerPass,
} from "@/lib/actions/admin";

export const metadata = { title: "Inscriptions formations — Administration" };

const MOYENS: { value: string; label: string }[] = [
  { value: "WAVE", label: "Wave" },
  { value: "ORANGE_MONEY", label: "Orange Money" },
  { value: "FREE_MONEY", label: "Free Money" },
  { value: "CARTE_BANCAIRE", label: "Carte bancaire" },
  { value: "ESPECES_SALON", label: "Especes (salon)" },
];

const STATUT_LABEL: Record<string, string> = {
  EN_ATTENTE_PAIEMENT: "En attente de paiement",
  CONFIRMEE: "Confirmee",
  LISTE_ATTENTE: "Liste d'attente",
  ANNULEE: "Annulee",
};

export default async function AdminInscriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ maj?: string }>;
}) {
  const session = await verifySession();
  if (!session) redirect("/connexion");
  if (session.role !== "ADMIN") redirect("/admin");
  const { maj } = await searchParams;

  const enAttente = await prisma.inscription.findMany({
    where: { statut: "EN_ATTENTE_PAIEMENT" },
    include: { eleve: true, formation: true },
    orderBy: { createdAt: "asc" },
  });

  const recentes = await prisma.inscription.findMany({
    where: { statut: { in: ["CONFIRMEE", "ANNULEE"] } },
    include: { eleve: true, formation: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const passEnAttente = await prisma.pass.findMany({
    where: { statut: "EN_ATTENTE_PAIEMENT" },
    include: { eleve: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <section className="mx-auto max-w-4xl px-6 py-20">
      <p className="text-xs uppercase tracking-[0.1em] text-[var(--brass)]">
        <Link href="/admin">&larr; Tableau de bord</Link>
      </p>
      <h1 className="font-display mt-3 text-2xl uppercase tracking-[0.12em]">
        Inscriptions aux formations
      </h1>

      {maj === "ok" && (
        <p className="mt-4 border border-[var(--brass)] bg-[var(--blush)] px-4 py-3 text-sm">
          Inscription confirmee : la formation est debloquee pour l&apos;eleve.
        </p>
      )}
      {maj === "annulee" && (
        <p className="mt-4 border border-[var(--ligne)] bg-white px-4 py-3 text-sm">
          Demande annulee.
        </p>
      )}
      {maj === "pass" && (
        <p className="mt-4 border border-[var(--brass)] bg-[var(--blush)] px-4 py-3 text-sm">
          Pass active : toutes les formations en ligne sont debloquees pour l&apos;eleve.
        </p>
      )}

      {passEnAttente.length > 0 && (
        <>
          <h2 className="mt-10 font-display text-sm uppercase tracking-[0.12em]">
            👑 Pass All Access a valider ({passEnAttente.length})
          </h2>
          <ul className="mt-4 flex flex-col gap-4">
            {passEnAttente.map((pass) => (
              <li key={pass.id} className="border border-[var(--brass)] bg-white p-5 text-sm">
                <p className="font-medium">Radiaglam Academy Pass — {pass.eleve.nom}</p>
                <p className="text-[var(--gris)]">
                  {pass.eleve.email}
                  {pass.eleve.telephone ? ` · ${pass.eleve.telephone}` : ""} ·{" "}
                  {pass.prixFcfa.toLocaleString("fr-FR")} FCFA · demande le{" "}
                  {pass.createdAt.toLocaleDateString("fr-FR")}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <form action={confirmerPass.bind(null, pass.id)} className="flex items-center gap-2">
                    <select
                      name="moyen"
                      defaultValue="WAVE"
                      className="border border-[var(--noir)] bg-white px-2 py-1.5 text-xs uppercase tracking-[0.08em]"
                    >
                      {MOYENS.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="border border-[var(--noir)] bg-[var(--noir)] px-4 py-1.5 text-xs uppercase tracking-[0.08em] text-[var(--porcelaine)]"
                    >
                      Activer le Pass
                    </button>
                  </form>
                  <form action={annulerPass.bind(null, pass.id)}>
                    <button
                      type="submit"
                      className="border border-red-700 px-3 py-1.5 text-xs uppercase tracking-[0.08em] text-red-700"
                    >
                      Annuler
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      <h2 className="mt-10 font-display text-sm uppercase tracking-[0.12em]">
        Demandes a valider ({enAttente.length})
      </h2>
      {enAttente.length === 0 ? (
        <p className="mt-3 text-sm text-[var(--gris)]">Aucune demande en attente.</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-4">
          {enAttente.map((i) => (
            <li key={i.id} className="border border-[var(--noir)] bg-white p-5 text-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{i.formation.titre}</p>
                  <p className="text-[var(--gris)]">
                    {i.eleve.nom} · {i.eleve.email}
                    {i.eleve.telephone ? ` · ${i.eleve.telephone}` : ""}
                  </p>
                  <p className="text-[var(--gris)]">
                    {i.formation.tarifFcfa.toLocaleString("fr-FR")} FCFA · demande le{" "}
                    {i.createdAt.toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <form
                  action={confirmerInscription.bind(null, i.id)}
                  className="flex items-center gap-2"
                >
                  <select
                    name="moyen"
                    defaultValue="WAVE"
                    className="border border-[var(--noir)] bg-white px-2 py-1.5 text-xs uppercase tracking-[0.08em]"
                  >
                    {MOYENS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="border border-[var(--noir)] bg-[var(--noir)] px-4 py-1.5 text-xs uppercase tracking-[0.08em] text-[var(--porcelaine)]"
                  >
                    Confirmer le paiement
                  </button>
                </form>
                <form action={annulerInscription.bind(null, i.id)}>
                  <button
                    type="submit"
                    className="border border-red-700 px-3 py-1.5 text-xs uppercase tracking-[0.08em] text-red-700"
                  >
                    Annuler
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}

      <h2 className="mt-14 font-display text-sm uppercase tracking-[0.12em]">Historique recent</h2>
      {recentes.length === 0 ? (
        <p className="mt-3 text-sm text-[var(--gris)]">Aucune inscription pour le moment.</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {recentes.map((i) => (
            <li
              key={i.id}
              className="flex items-center justify-between border border-[var(--ligne)] bg-white px-4 py-3 text-sm"
            >
              <span>
                {i.formation.titre} — {i.eleve.nom}
              </span>
              <span className="text-xs uppercase tracking-[0.1em] text-[var(--brass)]">
                {STATUT_LABEL[i.statut] ?? i.statut}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
