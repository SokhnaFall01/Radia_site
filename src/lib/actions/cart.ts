"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { verifySession } from "@/lib/dal";
import { addToCart, updateCartQuantity, clearCart, getCartDetails, FRAIS_LIVRAISON_DAKAR_FCFA } from "@/lib/cart";

export async function ajouterAuPanier(produitId: string, formData: FormData) {
  const quantite = Math.max(1, Number(formData.get("quantite")) || 1);
  await addToCart(produitId, quantite);
  revalidatePath("/boutique");
  revalidatePath("/boutique/panier");
}

export async function modifierQuantite(produitId: string, formData: FormData) {
  const quantite = Math.max(0, Number(formData.get("quantite")) || 0);
  await updateCartQuantity(produitId, quantite);
  revalidatePath("/boutique/panier");
}

export async function retirerDuPanier(produitId: string) {
  await updateCartQuantity(produitId, 0);
  revalidatePath("/boutique/panier");
}

export type CheckoutState = { message?: string } | undefined;

export async function passerCommande(
  _state: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const session = await verifySession();
  if (!session) redirect("/connexion");

  const livraison = formData.get("livraison");
  const adresse = formData.get("adresse");

  if (livraison !== "LIVRAISON" && livraison !== "RETRAIT_SALON") {
    return { message: "Merci de choisir un mode de réception." };
  }
  if (livraison === "LIVRAISON" && (typeof adresse !== "string" || !adresse.trim())) {
    return { message: "Merci de renseigner une adresse de livraison." };
  }

  const { items } = await getCartDetails();
  if (items.length === 0) {
    return { message: "Votre panier est vide." };
  }

  const fraisLivraison = livraison === "LIVRAISON" ? FRAIS_LIVRAISON_DAKAR_FCFA : 0;
  const totalFcfa = items.reduce((sum, i) => sum + i.sousTotal, 0) + fraisLivraison;

  await prisma.$transaction(async (tx) => {
    for (const item of items) {
      const produit = await tx.produit.findUnique({ where: { id: item.produit.id } });
      if (!produit || produit.stock < item.quantite) {
        throw new Error(`Stock insuffisant pour ${item.produit.nom}`);
      }
    }

    const commande = await tx.commande.create({
      data: {
        clienteId: session.userId,
        totalFcfa,
        livraison,
        adresse: livraison === "LIVRAISON" ? String(adresse) : null,
        statut: "EN_ATTENTE",
      },
    });

    for (const item of items) {
      await tx.ligneCommande.create({
        data: {
          commandeId: commande.id,
          produitId: item.produit.id,
          quantite: item.quantite,
          prixUnitaire: item.produit.prixFcfa,
        },
      });
      await tx.produit.update({
        where: { id: item.produit.id },
        data: { stock: { decrement: item.quantite } },
      });
    }
  });

  await clearCart();
  revalidatePath("/boutique");
  redirect("/espace/commandes?commande=confirmee");
}
