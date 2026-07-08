import Link from "next/link";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { updateDevisStatut } from "@/lib/actions/admin";

export const metadata = { title: "Demandes de devis — Administration" };

const TYPE_LABEL: Record<string, string> = {
  MARIAGE: "Mariage",
  HENNE: "Henne Time",
  MAQUILLAGE_SIMPLE: "Maquillage simple",
  AUTRE: "Autre",
};

const STATUT_LABEL: Record<string, string> = {
  NOUVEAU: "Nouveau",
  EN_COURS: "En cours",
  ENVOYE: "Envoye",
  ACCEPTE: "Accepte",
  REFUSE: "Refuse",
};

export default async function AdminDevisPage({
  searchParams,
}: {
  searchParams: Promise<{ maj?: string }>;
}) {
  const session = await verifySession();
  if (!session) redirect("/connexion");
  if (session.role !== "ADMIN") redirect("/admin");
  const { maj } = await searchParams;

  const demandes = await prisma.demandeDevis.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <section className="mx-auto max-w-4xl px-6 py-20">
      <p className="text-xs uppercase tracking-[0.1em] text-[var(--brass)]">
        <Link href="/admin">&larr; Tableau de bord</Link>
      </p>
      <h1 className="font-display mt-3 text-2xl uppercase tracking-[0.12em]">Demandes de devis</h1>

      {maj === "ok" && (
        <p className="mt-4 border border-[var(--brass)] bg-[var(--blush)] px-4 py-3 text-sm">
          Statut mis a jour.
        </p>
      )}

      <ul className="mt-8 flex flex-col gap-4">
        {demandes.map((d) => (
          <li key={d.id} className="border border-[var(--ligne)] bg-white p-5 text-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium">
                  {d.nom} — {TYPE_LABEL[d.typeEvenement] ?? d.typeEvenement}
                  {d.typeEvenement === "AUTRE" && d.precision ? ` (${d.precision})` : ""}
                </p>
                <p className="text-[var(--gris)]">
                  {d.date.toLocaleDateString("fr-FR", { timeZone: "UTC" })} · {d.ville}
                </p>
                <p className="text-[var(--gris)]">
                  {d.telephone}
                  {d.email ? ` · ${d.email}` : ""}
                </p>
                {d.message && <p className="mt-2 text-[var(--gris)]">{d.message}</p>}
              </div>
              <form action={updateDevisStatut.bind(null, d.id)} className="flex items-center gap-2">
                <select
                  name="statut"
                  defaultValue={d.statut}
                  className="border border-[var(--noir)] bg-white px-2 py-1.5 text-xs uppercase tracking-[0.08em]"
                >
                  {Object.entries(STATUT_LABEL).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="border border-[var(--noir)] px-3 py-1.5 text-xs uppercase tracking-[0.08em] hover:bg-[var(--noir)] hover:text-[var(--porcelaine)]"
                >
                  OK
                </button>
              </form>
            </div>
          </li>
        ))}
        {demandes.length === 0 && (
          <p className="text-sm text-[var(--gris)]">Aucune demande de devis pour le moment.</p>
        )}
      </ul>
    </section>
  );
}
