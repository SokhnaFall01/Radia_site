"use client";

import { useActionState } from "react";
import { reserver } from "@/lib/actions/reservation";

type Prestation = { id: string; nom: string; dureeMinutes: number; prixFcfa: number };
type Maquilleuse = { id: string; nom: string };

export default function ReservationForm({
  prestations,
  maquilleuses,
}: {
  prestations: Prestation[];
  maquilleuses: Maquilleuse[];
}) {
  const [state, action, pending] = useActionState(reserver, undefined);

  return (
    <form action={action} className="mt-10 flex max-w-md flex-col gap-5">
      <div>
        <label className="text-xs uppercase tracking-[0.1em]" htmlFor="prestationId">
          Prestation
        </label>
        <select
          id="prestationId"
          name="prestationId"
          required
          className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm"
        >
          {prestations.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nom} — {p.prixFcfa.toLocaleString("fr-FR")} FCFA ({p.dureeMinutes} min)
            </option>
          ))}
        </select>
      </div>

      {maquilleuses.length > 0 && (
        <div>
          <label className="text-xs uppercase tracking-[0.1em]" htmlFor="maquilleuseId">
            Maquilleuse (optionnel)
          </label>
          <select
            id="maquilleuseId"
            name="maquilleuseId"
            className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm"
          >
            <option value="">Sans preference</option>
            {maquilleuses.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nom}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="text-xs uppercase tracking-[0.1em]" htmlFor="date">
          Date &amp; heure
        </label>
        <input
          id="date"
          name="date"
          type="datetime-local"
          required
          className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm"
        />
      </div>

      {state?.message && <p className="text-xs text-red-700">{state.message}</p>}

      <button
        disabled={pending}
        type="submit"
        className="border border-[var(--noir)] bg-[var(--noir)] px-6 py-3 text-xs uppercase tracking-[0.12em] text-[var(--porcelaine)] disabled:opacity-50"
      >
        Demander le rendez-vous
      </button>
      <p className="text-xs text-[var(--gris)]">
        Le paiement en ligne (Wave / Orange Money) et la confirmation automatique seront actives
        des la connexion du compte marchand PayDunya/PayTech. Pour l&apos;instant, votre demande
        est enregistree et confirmee par le salon.
      </p>
    </form>
  );
}
