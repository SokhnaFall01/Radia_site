import { prisma } from "@/lib/db";
import { ajouterAuPanier } from "@/lib/actions/cart";

export const metadata = { title: "Boutique — Radia Glam" };

export default async function BoutiquePage() {
  const produits = await prisma.produit.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <section className="mx-auto max-w-5xl px-6 py-20">
      <h1 className="font-display text-2xl uppercase tracking-[0.12em]">Boutique</h1>
      <p className="mt-4 text-[var(--gris)]">Maquillage, pinceaux et accessoires Radia Glam.</p>

      {produits.length === 0 ? (
        <p className="mt-10 text-sm text-[var(--gris)]">
          Aucun produit disponible pour le moment. Ajoutez-en depuis le tableau de bord admin.
        </p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {produits.map((produit) => {
            const enRupture = produit.stock <= 0;
            const stockFaible = !enRupture && produit.stock <= produit.seuilAlerte;

            return (
              <div key={produit.id} className="border border-[var(--noir)] bg-white">
                {produit.photos[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={produit.photos[0]} alt={produit.nom} className="h-44 w-full object-cover" />
                ) : (
                  <div className="flex h-44 items-center justify-center bg-gradient-to-br from-[#f0e6dc] to-[#d9c0a8] text-sm italic text-[var(--noir)]/50">
                    Photo a venir
                  </div>
                )}
                <div className="p-5">
                <h2 className="font-display text-sm uppercase tracking-[0.1em]">{produit.nom}</h2>
                <p className="mt-1 text-xs uppercase tracking-[0.1em] text-[var(--gris)]">
                  {produit.categorie}
                </p>
                <p className="mt-3 text-sm">{produit.prixFcfa.toLocaleString("fr-FR")} FCFA</p>

                {enRupture ? (
                  <p className="mt-4 text-xs uppercase tracking-[0.1em] text-red-700">
                    Rupture de stock
                  </p>
                ) : (
                  <form action={ajouterAuPanier.bind(null, produit.id)} className="mt-4 flex gap-2">
                    <input
                      type="number"
                      name="quantite"
                      min={1}
                      max={produit.stock}
                      defaultValue={1}
                      className="w-16 border border-[var(--noir)] px-2 py-2 text-sm"
                    />
                    <button
                      type="submit"
                      className="flex-1 border border-[var(--noir)] bg-[var(--noir)] px-3 py-2 text-xs uppercase tracking-[0.1em] text-[var(--porcelaine)]"
                    >
                      Ajouter au panier
                    </button>
                  </form>
                )}
                {stockFaible && (
                  <p className="mt-2 text-xs uppercase tracking-[0.1em] text-[var(--brass)]">
                    Plus que {produit.stock} en stock
                  </p>
                )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
