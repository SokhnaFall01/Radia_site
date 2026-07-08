"use client";

import { useActionState, useState } from "react";
import { submitDevis } from "@/lib/actions/devis";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function DevisForm() {
  const [state, action, pending] = useActionState(submitDevis, undefined);
  const [typeEvenement, setTypeEvenement] = useState("MARIAGE");

  return (
    <form action={action} className="mt-10 flex flex-col gap-5">
      <div>
        <label className="text-xs uppercase tracking-[0.1em]" htmlFor="typeEvenement">
          Type d&apos;evenement
        </label>
        <select
          id="typeEvenement"
          name="typeEvenement"
          value={typeEvenement}
          onChange={(e) => setTypeEvenement(e.target.value)}
          className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm"
        >
          <option value="MARIAGE">Mariage</option>
          <option value="HENNE">Henne Time</option>
          <option value="MAQUILLAGE_SIMPLE">Maquillage simple</option>
          <option value="AUTRE">Autre</option>
        </select>
      </div>

      {typeEvenement === "AUTRE" && (
        <div>
          <label className="text-xs uppercase tracking-[0.1em]" htmlFor="precision">
            Precisez
          </label>
          <input
            id="precision"
            name="precision"
            placeholder="ex: shooting photo, anniversaire..."
            className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm"
          />
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="text-xs uppercase tracking-[0.1em]" htmlFor="date">
            Date souhaitee
          </label>
          <input
            id="date"
            name="date"
            type="date"
            min={todayIso()}
            required
            className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.1em]" htmlFor="ville">
            Ville
          </label>
          <input
            id="ville"
            name="ville"
            required
            placeholder="ex: Dakar"
            className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="text-xs uppercase tracking-[0.1em]" htmlFor="nom">
            Nom
          </label>
          <input
            id="nom"
            name="nom"
            required
            className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.1em]" htmlFor="telephone">
            Telephone
          </label>
          <input
            id="telephone"
            name="telephone"
            type="tel"
            required
            className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="text-xs uppercase tracking-[0.1em]" htmlFor="email">
          Email (optionnel)
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="text-xs uppercase tracking-[0.1em]" htmlFor="message">
          Details (optionnel)
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          placeholder="Nombre de personnes, prestations souhaitees, budget approximatif..."
          className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm"
        />
      </div>

      {state?.message && <p className="text-xs text-red-700">{state.message}</p>}

      <button
        disabled={pending}
        type="submit"
        className="self-start border border-[var(--noir)] bg-[var(--noir)] px-8 py-4 text-xs uppercase tracking-[0.18em] text-[var(--porcelaine)] disabled:opacity-50"
      >
        Envoyer ma demande
      </button>
    </form>
  );
}
