import Link from "next/link";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { getCartDetails, FRAIS_LIVRAISON_DAKAR_FCFA } from "@/lib/cart";
import CheckoutForm from "./checkout-form";

export const metadata = { title: "Commande — Radia Glam" };

export default async function CommandePage() {
  const session = await verifySession();
  if (!session) redirect("/connexion");

  const { items, totalFcfa } = await getCartDetails();
  if (items.length === 0) redirect("/boutique/panier");

  return (
    <section className="mx-auto max-w-2xl px-6 py-20">
      <h1 className="font-display text-2xl uppercase tracking-[0.12em]">Confirmer la commande</h1>

      <ul className="mt-6 flex flex-col gap-2 text-sm">
        {items.map(({ produit, quantite, sousTotal }) => (
          <li key={produit.id} className="flex justify-between border-b border-[var(--ligne)] py-2">
            <span>
              {produit.nom} x {quantite}
            </span>
            <span>{sousTotal.toLocaleString("fr-FR")} FCFA</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-right text-sm">
        Sous-total : <span className="font-medium">{totalFcfa.toLocaleString("fr-FR")} FCFA</span>
      </p>

      <CheckoutForm fraisLivraison={FRAIS_LIVRAISON_DAKAR_FCFA} />

      <p className="mt-6 text-xs">
        <Link href="/boutique/panier" className="underline">
          Retour au panier
        </Link>
      </p>
    </section>
  );
}
