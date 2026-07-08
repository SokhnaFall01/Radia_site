import DevisForm from "./devis-form";
import { getSiteTextes } from "@/lib/contenuTextes";

export const metadata = { title: "Demander un devis — Radia Glam" };

export default async function DevisPage({
  searchParams,
}: {
  searchParams: Promise<{ envoye?: string }>;
}) {
  const [t, { envoye }] = await Promise.all([getSiteTextes(), searchParams]);

  return (
    <section className="mx-auto max-w-2xl px-6 py-20">
      <h1 className="font-display text-2xl uppercase tracking-[0.12em]">{t.devisTitre}</h1>
      <p className="mt-4 text-[var(--gris)]">{t.devisIntro}</p>
      {t.devisDeplacement && (
        <p className="mt-4 border border-[var(--brass)] bg-[var(--blush)] px-4 py-3 text-sm">
          {t.devisDeplacement}
        </p>
      )}

      {envoye === "1" ? (
        <div className="mt-10 border border-[var(--brass)] bg-[var(--blush)] p-6 text-sm">
          <p className="font-medium">Votre demande a bien été envoyée.</p>
          <p className="mt-2 text-[var(--gris)]">
            Le salon revient vers vous rapidement par téléphone ou email avec une proposition de
            devis.
          </p>
        </div>
      ) : (
        <DevisForm />
      )}
    </section>
  );
}
