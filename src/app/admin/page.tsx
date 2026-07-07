import Link from "next/link";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/db";

export const metadata = { title: "Administration — Radia Glam" };

export default async function AdminPage() {
  const session = await verifySession();
  if (!session) redirect("/connexion");
  if (session.role !== "ADMIN" && session.role !== "STAFF") redirect("/");

  const isStaffOnly = session.role === "STAFF";

  const rendezVous = await prisma.rendezVous.findMany({
    where: isStaffOnly ? { maquilleuseId: session.userId } : {},
    include: { prestation: true, cliente: true },
    orderBy: { date: "asc" },
    take: 20,
  });

  return (
    <section className="mx-auto max-w-4xl px-6 py-20">
      <h1 className="font-display text-2xl uppercase tracking-[0.12em]">
        {isStaffOnly ? "Mon agenda" : "Tableau de bord"}
      </h1>

      <h2 className="mt-10 font-display text-sm uppercase tracking-[0.12em]">
        Rendez-vous {isStaffOnly ? "" : "(tous)"}
      </h2>
      {rendezVous.length === 0 ? (
        <p className="mt-3 text-sm text-[var(--gris)]">Aucun rendez-vous.</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {rendezVous.map((rdv) => (
            <li key={rdv.id} className="border border-[var(--ligne)] bg-white p-4 text-sm">
              <p className="font-medium">
                {rdv.prestation.nom} — {rdv.cliente.nom}
              </p>
              <p className="text-[var(--gris)]">{rdv.date.toLocaleString("fr-FR")}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.1em] text-[var(--brass)]">
                {rdv.statut} · {rdv.origine}
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
          {["Elèves & clientes", "Contenus du site & photos"].map((label) => (
            <div
              key={label}
              className="border border-dashed border-[var(--ligne)] bg-white p-5 text-sm text-[var(--gris)]"
            >
              {label}
              <span className="ml-2 text-xs uppercase tracking-[0.1em] text-[var(--brass)]">
                A venir
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
