import Link from "next/link";
import { getCartDetails } from "@/lib/cart";
import { modifierQuantite, retirerDuPanier } from "@/lib/actions/cart";

export const metadata = { title: "Panier — Radia Glam" };

export default async function PanierPage() {
  const { items, totalFcfa } = await getCartDetails();

  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="font-display text-2xl uppercase tracking-[0.12em]">Mon panier</h1>

      {items.length === 0 ? (
        <p className="mt-6 text-sm text-[var(--gris)]">
          Votre panier est vide.{" "}
          <Link href="/boutique" className="underline">
            Voir la boutique
          </Link>
          .
        </p>
      ) : (
        <>
          <ul className="mt-8 flex flex-col gap-3">
            {items.map(({ produit, quantite, sousTotal }) => (
              <li
                key={produit.id}
                className="flex items-center justify-between border border-[var(--ligne)] bg-white p-4 text-sm"
              >
                <div>
                  <p className="font-medium">{produit.nom}</p>
                  <p className="text-[var(--gris)]">
                    {produit.prixFcfa.toLocaleString("fr-FR")} FCFA x {quantite} ={" "}
                    {sousTotal.toLocaleString("fr-FR")} FCFA
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <form action={modifierQuantite.bind(null, produit.id)} className="flex gap-2">
                    <input
                      type="number"
                      name="quantite"
                      min={1}
                      max={produit.stock}
                      defaultValue={quantite}
                      className="w-16 border border-[var(--noir)] px-2 py-1 text-sm"
                    />
                    <button
                      type="submit"
                      className="border border-[var(--noir)] px-3 py-1 text-xs uppercase tracking-[0.1em]"
                    >
                      Mettre a jour
                    </button>
                  </form>
                  <form action={retirerDuPanier.bind(null, produit.id)}>
                    <button
                      type="submit"
                      className="border border-red-700 px-3 py-1 text-xs uppercase tracking-[0.1em] text-red-700"
                    >
                      Retirer
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>

          <p className="mt-6 text-right text-sm">
            Sous-total : <span className="font-medium">{totalFcfa.toLocaleString("fr-FR")} FCFA</span>
          </p>

          <Link
            href="/boutique/commande"
            className="mt-6 block border border-[var(--noir)] bg-[var(--noir)] px-6 py-3 text-center text-xs uppercase tracking-[0.12em] text-[var(--porcelaine)]"
          >
            Passer la commande
          </Link>
        </>
      )}
    </section>
  );
}
