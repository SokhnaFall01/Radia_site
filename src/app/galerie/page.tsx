export const metadata = { title: "Galerie — Radia Glam" };

export default function GaleriePage() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-20">
      <h1 className="font-display text-2xl uppercase tracking-[0.12em]">Galerie</h1>
      <p className="mt-4 text-[var(--gris)]">
        Realisations du salon et travaux des eleves. Les photos sont ajoutees depuis le tableau de
        bord admin.
      </p>
      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex aspect-square items-center justify-center border border-dashed border-[var(--ligne)] bg-white text-xs uppercase tracking-[0.1em] text-[var(--gris)]"
          >
            Photo a venir
          </div>
        ))}
      </div>
    </section>
  );
}
