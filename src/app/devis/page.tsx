import DevisForm from "./devis-form";

export const metadata = { title: "Demander un devis — Radia Glam" };

export default async function DevisPage({
  searchParams,
}: {
  searchParams: Promise<{ envoye?: string }>;
}) {
  const { envoye } = await searchParams;

  return (
    <section className="mx-auto max-w-2xl px-6 py-20">
      <h1 className="font-display text-2xl uppercase tracking-[0.12em]">Demander un devis</h1>
      <p className="mt-4 text-[var(--gris)]">
        Mariage, Henne Time, maquillage simple ou un tout autre projet : decrivez votre evenement
        et nous revenons vers vous avec une proposition sur mesure.
      </p>

      {envoye === "1" ? (
        <div className="mt-10 border border-[var(--brass)] bg-[var(--blush)] p-6 text-sm">
          <p className="font-medium">Votre demande a bien ete envoyee.</p>
          <p className="mt-2 text-[var(--gris)]">
            Le salon revient vers vous rapidement par telephone ou email avec une proposition de
            devis.
          </p>
        </div>
      ) : (
        <DevisForm />
      )}
    </section>
  );
}
