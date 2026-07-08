import { prisma } from "@/lib/db";
import { getSiteTextes } from "@/lib/contenuTextes";

export const metadata = { title: "Galerie — Radia Glam" };

export default async function GaleriePage() {
  const [t, photos] = await Promise.all([
    getSiteTextes(),
    prisma.photoGalerie.findMany({ orderBy: { ordre: "asc" } }),
  ]);

  return (
    <section className="mx-auto max-w-5xl px-6 py-20">
      <h1 className="font-display text-2xl uppercase tracking-[0.12em]">{t.galerieTitre}</h1>
      <p className="mt-4 text-[var(--gris)]">{t.galerieIntro}</p>

      {photos.length === 0 ? (
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex aspect-square items-center justify-center border border-dashed border-[var(--ligne)] bg-white text-xs uppercase tracking-[0.1em] text-[var(--gris)]"
            >
              Photo à venir
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {photos.map((photo) => (
            <figure key={photo.id} className="aspect-square overflow-hidden bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.url} alt={photo.legende ?? ""} className="h-full w-full object-cover" />
              {photo.legende && (
                <figcaption className="mt-2 text-center text-xs uppercase tracking-[0.1em] text-[var(--gris)]">
                  {photo.legende}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      )}
    </section>
  );
}
