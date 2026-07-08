"use client";

import { useActionState, useState } from "react";
import { passerCommande } from "@/lib/actions/cart";

export default function CheckoutForm({ fraisLivraison }: { fraisLivraison: number }) {
  const [state, action, pending] = useActionState(passerCommande, undefined);
  const [livraison, setLivraison] = useState<"LIVRAISON" | "RETRAIT_SALON">("RETRAIT_SALON");

  return (
    <form action={action} className="mt-8 flex flex-col gap-5">
      <div className="flex flex-col gap-2 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="livraison"
            value="RETRAIT_SALON"
            checked={livraison === "RETRAIT_SALON"}
            onChange={() => setLivraison("RETRAIT_SALON")}
          />
          Retrait au salon (gratuit)
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="livraison"
            value="LIVRAISON"
            checked={livraison === "LIVRAISON"}
            onChange={() => setLivraison("LIVRAISON")}
          />
          Livraison à Dakar (+{fraisLivraison.toLocaleString("fr-FR")} FCFA)
        </label>
      </div>

      {livraison === "LIVRAISON" && (
        <div>
          <label className="text-xs uppercase tracking-[0.1em]" htmlFor="adresse">
            Adresse de livraison
          </label>
          <input
            id="adresse"
            name="adresse"
            required
            className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm"
          />
        </div>
      )}

      {state?.message && <p className="text-xs text-red-700">{state.message}</p>}

      <button
        disabled={pending}
        type="submit"
        className="border border-[var(--noir)] bg-[var(--noir)] px-6 py-3 text-xs uppercase tracking-[0.12em] text-[var(--porcelaine)] disabled:opacity-50"
      >
        Confirmer la commande
      </button>
      <p className="text-xs text-[var(--gris)]">
        Paiement en ligne à venir (Wave / Orange Money). Pour l&apos;instant, le règlement se fait
        en espèces au retrait ou à la livraison.
      </p>
    </form>
  );
}
