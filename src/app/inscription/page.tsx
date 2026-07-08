"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signup } from "@/lib/actions/auth";

export default function InscriptionPage() {
  const [state, action, pending] = useActionState(signup, undefined);

  return (
    <section className="mx-auto max-w-sm px-6 py-20">
      <h1 className="font-display text-2xl uppercase tracking-[0.12em]">Créer un compte</h1>
      <form action={action} className="mt-8 flex flex-col gap-4">
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
          {state?.errors?.nom && <p className="mt-1 text-xs text-red-700">{state.errors.nom[0]}</p>}
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.1em]" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm"
          />
          {state?.errors?.email && (
            <p className="mt-1 text-xs text-red-700">{state.errors.email[0]}</p>
          )}
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.1em]" htmlFor="telephone">
            Téléphone (optionnel)
          </label>
          <input
            id="telephone"
            name="telephone"
            className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.1em]" htmlFor="password">
            Mot de passe
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm"
          />
          {state?.errors?.password && (
            <ul className="mt-1 text-xs text-red-700">
              {state.errors.password.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          )}
        </div>
        {state?.message && <p className="text-xs text-red-700">{state.message}</p>}
        <button
          disabled={pending}
          type="submit"
          className="mt-2 border border-[var(--noir)] bg-[var(--noir)] px-6 py-3 text-xs uppercase tracking-[0.12em] text-[var(--porcelaine)] disabled:opacity-50"
        >
          Créer mon compte
        </button>
      </form>
      <p className="mt-6 text-sm text-[var(--gris)]">
        Déjà un compte ?{" "}
        <Link href="/connexion" className="underline">
          Se connecter
        </Link>
      </p>
    </section>
  );
}
