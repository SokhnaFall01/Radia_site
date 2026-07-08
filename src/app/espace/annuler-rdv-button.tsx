"use client";

import { useTransition } from "react";
import { annulerRendezVous } from "@/lib/actions/reservation";

export default function AnnulerRdvButton({
  rdvId,
  acompteFcfa,
}: {
  rdvId: string;
  acompteFcfa: number | null;
}) {
  const [pending, startTransition] = useTransition();

  const message = acompteFcfa
    ? `Annuler ce rendez-vous ?\n\nAttention : l'acompte versé (${acompteFcfa.toLocaleString("fr-FR")} FCFA) n'est pas remboursable.`
    : "Annuler ce rendez-vous ?";

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (window.confirm(message)) {
          startTransition(() => annulerRendezVous(rdvId));
        }
      }}
      className="border border-red-700 px-3 py-1.5 text-xs uppercase tracking-[0.1em] text-red-700 hover:bg-red-700 hover:text-white disabled:opacity-50"
    >
      {pending ? "Annulation..." : "Annuler"}
    </button>
  );
}
