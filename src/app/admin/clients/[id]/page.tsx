import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { updateUserRole } from "@/lib/actions/admin";

export default async function AdminClientProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ maj?: string }>;
}) {
  const session = await verifySession();
  if (!session) redirect("/connexion");
  if (session.role !== "ADMIN") redirect("/admin");
  const { id } = await params;
  const { maj } = await searchParams;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      rendezVousClient: { include: { prestation: true }, orderBy: { date: "desc" } },
      rendezVousStaff: { include: { prestation: true, cliente: true }, orderBy: { date: "desc" } },
      commandes: { include: { lignes: { include: { produit: true } } }, orderBy: { createdAt: "desc" } },
      inscriptions: { include: { session: { include: { formation: true } } }, orderBy: { createdAt: "desc" } },
      certificats: true,
    },
  });
  if (!user || (user.role !== "CLIENTE" && user.role !== "STAFF")) notFound();

  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <p className="text-xs uppercase tracking-[0.1em] text-[var(--brass)]">
        <Link href="/admin/clients">&larr; Clients &amp; élèves</Link>
      </p>
      <h1 className="font-display mt-3 text-2xl uppercase tracking-[0.12em]">{user.nom}</h1>
      <p className="mt-2 text-sm text-[var(--gris)]">
        {user.email}
        {user.telephone ? ` · ${user.telephone}` : ""} · membre depuis{" "}
        {user.createdAt.toLocaleDateString("fr-FR")}
      </p>

      {maj === "ok" && (
        <p className="mt-4 border border-[var(--brass)] bg-[var(--blush)] px-4 py-3 text-sm">
          Rôle mis à jour.
        </p>
      )}

      <form action={updateUserRole.bind(null, user.id)} className="mt-6 flex items-center gap-3">
        <label className="text-xs uppercase tracking-[0.1em]" htmlFor="role">Role</label>
        <select
          id="role"
          name="role"
          defaultValue={user.role}
          className="border border-[var(--noir)] bg-white px-3 py-2 text-sm"
        >
          <option value="CLIENTE">Cliente</option>
          <option value="STAFF">Staff (maquilleuse)</option>
        </select>
        <button
          type="submit"
          className="border border-[var(--noir)] px-4 py-2 text-xs uppercase tracking-[0.1em] hover:bg-[var(--noir)] hover:text-[var(--porcelaine)]"
        >
          Enregistrer
        </button>
      </form>

      {user.role === "STAFF" && (
        <>
          <h2 className="mt-14 font-display text-sm uppercase tracking-[0.12em]">
            Rendez-vous assignes ({user.rendezVousStaff.length})
          </h2>
          <ul className="mt-4 flex flex-col gap-3">
            {user.rendezVousStaff.map((rdv) => (
              <li key={rdv.id} className="border border-[var(--ligne)] bg-white p-4 text-sm">
                <p className="font-medium">
                  {rdv.prestation.nom} — {rdv.cliente.nom}
                </p>
                <p className="text-[var(--gris)]">
                  {rdv.date.toLocaleString("fr-FR", { timeZone: "UTC" })}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.1em] text-[var(--brass)]">
                  {rdv.statut}
                </p>
              </li>
            ))}
            {user.rendezVousStaff.length === 0 && (
              <p className="text-sm text-[var(--gris)]">Aucun rendez-vous assigné.</p>
            )}
          </ul>
        </>
      )}

      <h2 className="mt-14 font-display text-sm uppercase tracking-[0.12em]">
        Rendez-vous ({user.rendezVousClient.length})
      </h2>
      <ul className="mt-4 flex flex-col gap-3">
        {user.rendezVousClient.map((rdv) => (
          <li key={rdv.id} className="border border-[var(--ligne)] bg-white p-4 text-sm">
            <p className="font-medium">{rdv.prestation.nom}</p>
            <p className="text-[var(--gris)]">
              {rdv.date.toLocaleString("fr-FR", { timeZone: "UTC" })}
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.1em] text-[var(--brass)]">{rdv.statut}</p>
          </li>
        ))}
        {user.rendezVousClient.length === 0 && (
          <p className="text-sm text-[var(--gris)]">Aucun rendez-vous.</p>
        )}
      </ul>

      <h2 className="mt-14 font-display text-sm uppercase tracking-[0.12em]">
        Commandes ({user.commandes.length})
      </h2>
      <ul className="mt-4 flex flex-col gap-3">
        {user.commandes.map((c) => (
          <li key={c.id} className="border border-[var(--ligne)] bg-white p-4 text-sm">
            <p className="font-medium">{c.totalFcfa.toLocaleString("fr-FR")} FCFA</p>
            <p className="text-[var(--gris)]">
              {c.lignes.map((l) => `${l.produit.nom} x${l.quantite}`).join(", ")}
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.1em] text-[var(--brass)]">{c.statut}</p>
          </li>
        ))}
        {user.commandes.length === 0 && <p className="text-sm text-[var(--gris)]">Aucune commande.</p>}
      </ul>

      <h2 className="mt-14 font-display text-sm uppercase tracking-[0.12em]">
        Formations ({user.inscriptions.length})
      </h2>
      <ul className="mt-4 flex flex-col gap-3">
        {user.inscriptions.map((i) => (
          <li key={i.id} className="border border-[var(--ligne)] bg-white p-4 text-sm">
            <p className="font-medium">{i.session.formation.titre}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.1em] text-[var(--brass)]">{i.statut}</p>
          </li>
        ))}
        {user.inscriptions.length === 0 && (
          <p className="text-sm text-[var(--gris)]">Aucune formation.</p>
        )}
      </ul>

      {user.certificats.length > 0 && (
        <>
          <h2 className="mt-14 font-display text-sm uppercase tracking-[0.12em]">Certificats</h2>
          <ul className="mt-4 flex flex-col gap-2">
            {user.certificats.map((cert) => (
              <li key={cert.id} className="text-sm">
                <a href={`/api/certificats/${cert.id}`} className="border-b border-[var(--brass)]">
                  {cert.numero}
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
