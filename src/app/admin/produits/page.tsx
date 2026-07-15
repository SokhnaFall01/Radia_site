import Link from "next/link";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { createProduit, updateProduit, deleteProduit } from "@/lib/actions/admin";

export const metadata = { title: "Produits — Administration" };

export default async function AdminProduitsPage({
  searchParams,
}: {
  searchParams: Promise<{ maj?: string; erreur?: string }>;
}) {
  const session = await verifySession();
  if (!session) redirect("/connexion");
  if (session.role !== "ADMIN") redirect("/admin");
  const { maj, erreur } = await searchParams;

  const produits = await prisma.produit.findMany({ orderBy: { nom: "asc" } });

  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <p className="text-xs uppercase tracking-[0.1em] text-[var(--brass)]">
        <Link href="/admin">&larr; Tableau de bord</Link>
      </p>
      <h1 className="font-display mt-3 text-2xl uppercase tracking-[0.12em]">Produits &amp; stocks</h1>

      {maj === "ok" && (
        <p className="mt-4 border border-[var(--brass)] bg-[var(--blush)] px-4 py-3 text-sm">
          Produit mis à jour.
        </p>
      )}
      {erreur === "suppression" && (
        <p className="mt-4 border border-red-700 bg-red-50 px-4 py-3 text-sm text-red-700">
          Impossible de supprimer : ce produit apparaît dans des commandes existantes.
        </p>
      )}
      {erreur === "photo" && (
        <p className="mt-4 border border-red-700 bg-red-50 px-4 py-3 text-sm text-red-700">
          Photo invalide (jpg/png/webp, 10 Mo max).
        </p>
      )}

      <ul className="mt-8 flex flex-col gap-4">
        {produits.map((p) => (
          <li key={p.id} className="border border-[var(--ligne)] bg-white p-4 text-sm">
            <form action={updateProduit.bind(null, p.id)} className="flex flex-wrap items-end gap-3">
              {p.photos[0] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.photos[0]} alt="" className="h-16 w-16 object-cover" />
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
                <label className="text-xs uppercase tracking-[0.1em]">Catégorie</label>
                <input name="categorie" defaultValue={p.categorie} required className="mt-1 block border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.1em]">Prix (FCFA)</label>
                <input name="prixFcfa" type="number" min={0} defaultValue={p.prixFcfa} required className="mt-1 block w-28 border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.1em]">Stock</label>
                <input name="stock" type="number" min={0} defaultValue={p.stock} required className="mt-1 block w-20 border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.1em]">Seuil alerte</label>
                <input name="seuilAlerte" type="number" min={0} defaultValue={p.seuilAlerte} className="mt-1 block w-20 border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
              </div>
              <label className="flex items-center gap-2 pb-2.5 text-sm">
                <input type="checkbox" name="misEnAvant" defaultChecked={p.misEnAvant} />
                Mis en avant (accueil)
              </label>
              <button type="submit" className="border border-[var(--noir)] px-4 py-2.5 text-xs uppercase tracking-[0.1em] hover:bg-[var(--noir)] hover:text-[var(--porcelaine)]">
                Enregistrer
              </button>
            </form>
            {p.stock <= p.seuilAlerte && (
              <p className="mt-2 text-xs uppercase tracking-[0.1em] text-[var(--brass)]">
                Stock faible ({p.stock} restant{p.stock > 1 ? "s" : ""})
              </p>
            )}
            <form action={deleteProduit.bind(null, p.id)} className="mt-2">
              <button type="submit" className="text-xs uppercase tracking-[0.1em] text-red-700">
                Supprimer
              </button>
            </form>
          </li>
        ))}
        {produits.length === 0 && (
          <p className="text-sm text-[var(--gris)]">Aucun produit pour le moment.</p>
        )}
      </ul>

      <h2 className="mt-14 font-display text-sm uppercase tracking-[0.12em]">Ajouter un produit</h2>
      <form action={createProduit} className="mt-6 flex flex-wrap items-end gap-4">
        <div>
          <label className="text-xs uppercase tracking-[0.1em]" htmlFor="photo">Photo</label>
          <input id="photo" name="photo" type="file" accept="image/jpeg,image/png,image/webp" className="mt-1 block text-sm" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.1em]" htmlFor="nom">Nom</label>
          <input id="nom" name="nom" required className="mt-1 border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.1em]" htmlFor="categorie">Catégorie</label>
          <input id="categorie" name="categorie" required className="mt-1 border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.1em]" htmlFor="prixFcfa">Prix (FCFA)</label>
          <input id="prixFcfa" name="prixFcfa" type="number" min={0} required className="mt-1 w-28 border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.1em]" htmlFor="stock">Stock</label>
          <input id="stock" name="stock" type="number" min={0} required defaultValue={0} className="mt-1 w-20 border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.1em]" htmlFor="seuilAlerte">Seuil alerte</label>
          <input id="seuilAlerte" name="seuilAlerte" type="number" min={0} defaultValue={5} className="mt-1 w-20 border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
        </div>
        <label className="flex items-center gap-2 pb-2.5 text-sm">
          <input type="checkbox" name="misEnAvant" />
          Mis en avant (accueil)
        </label>
        <button type="submit" className="border border-[var(--noir)] bg-[var(--noir)] px-6 py-3 text-xs uppercase tracking-[0.12em] text-[var(--porcelaine)]">
          Créer
        </button>
      </form>
    </section>
  );
}
