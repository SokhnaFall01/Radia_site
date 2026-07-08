import Link from "next/link";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { createPrestation, updatePrestation, deletePrestation } from "@/lib/actions/admin";

export const metadata = { title: "Prestations — Administration" };

export default async function AdminPrestationsPage({
  searchParams,
}: {
  searchParams: Promise<{ maj?: string; erreur?: string }>;
}) {
  const session = await verifySession();
  if (!session) redirect("/connexion");
  if (session.role !== "ADMIN") redirect("/admin");
  const { maj, erreur } = await searchParams;

  const prestations = await prisma.prestation.findMany({ orderBy: { nom: "asc" } });

  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <p className="text-xs uppercase tracking-[0.1em] text-[var(--brass)]">
        <Link href="/admin">&larr; Tableau de bord</Link>
      </p>
      <h1 className="font-display mt-3 text-2xl uppercase tracking-[0.12em]">Prestations</h1>

      {maj === "ok" && (
        <p className="mt-4 border border-[var(--brass)] bg-[var(--blush)] px-4 py-3 text-sm">
          Prestation mise à jour.
        </p>
      )}
      {erreur === "suppression" && (
        <p className="mt-4 border border-red-700 bg-red-50 px-4 py-3 text-sm text-red-700">
          Impossible de supprimer : des rendez-vous utilisent cette prestation.
        </p>
      )}
      {erreur === "photo" && (
        <p className="mt-4 border border-red-700 bg-red-50 px-4 py-3 text-sm text-red-700">
          Photo invalide (jpg/png/webp, 10 Mo max).
        </p>
      )}

      <ul className="mt-8 flex flex-col gap-4">
        {prestations.map((p) => (
          <li key={p.id} className="border border-[var(--ligne)] bg-white p-4 text-sm">
            <form action={updatePrestation.bind(null, p.id)} className="flex flex-wrap items-end gap-3">
              {p.photo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.photo} alt="" className="h-16 w-16 object-cover" />
              )}
              <div>
                <label className="text-xs uppercase tracking-[0.1em]">Photo</label>
                <input name="photo" type="file" accept="image/jpeg,image/png,image/webp" className="mt-1 block text-sm" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.1em]">Nom</label>
                <input name="nom" defaultValue={p.nom} required className="mt-1 block border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.1em]">Durée (min)</label>
                <input name="dureeMinutes" type="number" min={1} defaultValue={p.dureeMinutes} required className="mt-1 block w-24 border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.1em]">Prix (FCFA)</label>
                <input name="prixFcfa" type="number" min={0} defaultValue={p.prixFcfa} required className="mt-1 block w-28 border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.1em]">Acompte (FCFA)</label>
                <input name="acompteRequis" type="number" min={0} defaultValue={p.acompteRequis ?? ""} className="mt-1 block w-28 border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
              </div>
              <label className="flex items-center gap-2 pb-2 text-sm">
                <input type="checkbox" name="actif" defaultChecked={p.actif} />
                Active
              </label>
              <button type="submit" className="border border-[var(--noir)] px-4 py-2.5 text-xs uppercase tracking-[0.1em] hover:bg-[var(--noir)] hover:text-[var(--porcelaine)]">
                Enregistrer
              </button>
            </form>
            <form action={deletePrestation.bind(null, p.id)} className="mt-2">
              <button type="submit" className="text-xs uppercase tracking-[0.1em] text-red-700">
                Supprimer
              </button>
            </form>
          </li>
        ))}
        {prestations.length === 0 && (
          <p className="text-sm text-[var(--gris)]">Aucune prestation pour le moment.</p>
        )}
      </ul>

      <h2 className="mt-14 font-display text-sm uppercase tracking-[0.12em]">Ajouter une prestation</h2>
      <form action={createPrestation} className="mt-6 flex flex-wrap items-end gap-4">
        <div>
          <label className="text-xs uppercase tracking-[0.1em]" htmlFor="photo">Photo</label>
          <input id="photo" name="photo" type="file" accept="image/jpeg,image/png,image/webp" className="mt-1 block text-sm" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.1em]" htmlFor="nom">Nom</label>
          <input id="nom" name="nom" required className="mt-1 border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.1em]" htmlFor="dureeMinutes">Durée (min)</label>
          <input id="dureeMinutes" name="dureeMinutes" type="number" min={1} required defaultValue={60} className="mt-1 w-24 border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.1em]" htmlFor="prixFcfa">Prix (FCFA)</label>
          <input id="prixFcfa" name="prixFcfa" type="number" min={0} required className="mt-1 w-28 border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.1em]" htmlFor="acompteRequis">Acompte (FCFA)</label>
          <input id="acompteRequis" name="acompteRequis" type="number" min={0} className="mt-1 w-28 border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
        </div>
        <label className="flex items-center gap-2 pb-2 text-sm">
          <input type="checkbox" name="actif" defaultChecked />
          Active
        </label>
        <button type="submit" className="border border-[var(--noir)] bg-[var(--noir)] px-6 py-3 text-xs uppercase tracking-[0.12em] text-[var(--porcelaine)]">
          Creer
        </button>
      </form>
    </section>
  );
}
