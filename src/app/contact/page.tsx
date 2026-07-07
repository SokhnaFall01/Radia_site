export const metadata = { title: "Contact — Radia Glam" };

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="font-display text-2xl uppercase tracking-[0.12em]">Contact</h1>
      <p className="mt-4 text-[var(--gris)]">
        Coordonnees, horaires et localisation du salon — geres depuis le tableau de bord admin. En
        attendant, contactez-nous directement :
      </p>
      <div className="mt-8 flex flex-col gap-4 sm:flex-row">
        <a
          href="https://wa.me/"
          className="border border-[var(--noir)] px-6 py-3 text-center text-xs uppercase tracking-[0.12em]"
        >
          WhatsApp
        </a>
        <a
          href="mailto:contact@radiaglam.com"
          className="border border-[var(--noir)] px-6 py-3 text-center text-xs uppercase tracking-[0.12em]"
        >
          Email
        </a>
      </div>
    </section>
  );
}
