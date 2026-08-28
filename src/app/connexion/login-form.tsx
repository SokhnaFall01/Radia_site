"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login } from "@/lib/actions/auth";

export default function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [state, action, pending] = useActionState(login, undefined);

  const inscriptionHref = redirectTo
    ? `/inscription?next=${encodeURIComponent(redirectTo)}`
    : "/inscription";

  return (
    <>
      <form action={action} className="mt-8 flex flex-col gap-4">
        {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}
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
        </div>
        {state?.message && <p className="text-xs text-red-700">{state.message}</p>}
        <button
          disabled={pending}
          type="submit"
          className="mt-2 border border-[var(--noir)] bg-[var(--noir)] px-6 py-3 text-xs uppercase tracking-[0.12em] text-[var(--porcelaine)] disabled:opacity-50"
        >
          Se connecter
        </button>
      </form>
      <p className="mt-6 text-sm text-[var(--gris)]">
        Pas encore de compte ?{" "}
        <Link href={inscriptionHref} className="underline">
          Creer un compte
        </Link>
      </p>
    </>
  );
}
