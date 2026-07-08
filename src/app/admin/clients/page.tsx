import Link from "next/link";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/db";

export const metadata = { title: "Clients & élèves — Administration" };

export default async function AdminClientsPage() {
  const session = await verifySession();
  if (!session) redirect("/connexion");
  if (session.role !== "ADMIN") redirect("/admin");

  const users = await prisma.user.findMany({
    where: { role: { in: ["CLIENTE", "STAFF"] } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      nom: true,
      email: true,
      telephone: true,
      role: true,
      createdAt: true,
      _count: {
        select: { rendezVousClient: true, commandes: true, inscriptions: true, rendezVousStaff: true },
      },
    },
  });

  return (
    <section className="mx-auto max-w-4xl px-6 py-20">
      <p className="text-xs uppercase tracking-[0.1em] text-[var(--brass)]">
        <Link href="/admin">&larr; Tableau de bord</Link>
      </p>
      <h1 className="font-display mt-3 text-2xl uppercase tracking-[0.12em]">Clients &amp; élèves</h1>
      <p className="mt-4 text-sm text-[var(--gris)]">
        {users.length} compte{users.length > 1 ? "s" : ""}. Cliquez sur une fiche pour voir le
        detail (rendez-vous, commandes, formations) ou attribuer le role staff.
      </p>

      <ul className="mt-8 flex flex-col gap-3">
        {users.map((u) => (
          <li key={u.id}>
            <Link
              href={`/admin/clients/${u.id}`}
              className="flex items-center justify-between border border-[var(--ligne)] bg-white p-4 text-sm hover:border-[var(--noir)]"
            >
              <div>
                <p className="font-medium">{u.nom}</p>
                <p className="text-[var(--gris)]">{u.email}</p>
                <p className="mt-1 text-xs text-[var(--gris)]">
                  {u._count.rendezVousClient} RDV · {u._count.commandes} commande(s) ·{" "}
                  {u._count.inscriptions} formation(s)
                  {u.role === "STAFF" && ` · ${u._count.rendezVousStaff} RDV assignes`}
                </p>
              </div>
              <span
                className={`text-xs uppercase tracking-[0.1em] ${u.role === "STAFF" ? "text-[var(--brass)]" : "text-[var(--gris)]"}`}
              >
                {u.role === "STAFF" ? "Staff" : "Cliente"}
              </span>
            </Link>
          </li>
        ))}
        {users.length === 0 && (
          <p className="text-sm text-[var(--gris)]">Aucun compte pour le moment.</p>
        )}
      </ul>
    </section>
  );
}
