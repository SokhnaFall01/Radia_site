import Link from "next/link";

export default function Home() {
  return (
    <div>
      <section className="mx-auto max-w-4xl px-6 py-24 text-center">
        <p className="font-italic-serif text-lg text-[var(--brass)]">Beauty &amp; Co.</p>
        <h1 className="font-display mt-3 text-3xl uppercase tracking-[0.12em] sm:text-5xl">
          Radia Glam
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-[var(--gris)]">
          Salon de maquillage, academy de formation et boutique — a Dakar, Senegal.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/reservation"
            className="border border-[var(--noir)] bg-[var(--noir)] px-6 py-3 text-xs uppercase tracking-[0.12em] text-[var(--porcelaine)]"
          >
            Reserver une prestation
          </Link>
          <Link
            href="/academy"
            className="border border-[var(--noir)] px-6 py-3 text-xs uppercase tracking-[0.12em]"
          >
            Decouvrir l&apos;Academy
          </Link>
        </div>
      </section>

      <section className="border-t border-[var(--ligne)] bg-white py-20">
        <div className="mx-auto grid max-w-5xl gap-10 px-6 sm:grid-cols-3">
          <div className="text-center">
            <h3 className="font-display text-sm uppercase tracking-[0.14em]">Salon</h3>
            <p className="mt-3 text-sm text-[var(--gris)]">
              Prestations de maquillage sur rendez-vous, avec ou sans preference de maquilleuse.
            </p>
          </div>
          <div className="text-center">
            <h3 className="font-display text-sm uppercase tracking-[0.14em]">Academy</h3>
            <p className="mt-3 text-sm text-[var(--gris)]">
              Formations Intensive, Intermediaire, Debutant, Automaquillage, Masterclass.
            </p>
          </div>
          <div className="text-center">
            <h3 className="font-display text-sm uppercase tracking-[0.14em]">Boutique</h3>
            <p className="mt-3 text-sm text-[var(--gris)]">
              Maquillage, pinceaux et accessoires Radia Glam — bientot disponible.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
