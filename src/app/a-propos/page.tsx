import Link from "next/link";
import { getSiteTextes } from "@/lib/contenuTextes";

export const metadata = { title: "À propos — Radia Glam" };

export default async function AProposPage() {
  const t = await getSiteTextes();

  return (
    <div>
      <section className="mx-auto max-w-5xl px-6 py-24">
        <div className="grid gap-14 sm:grid-cols-[minmax(260px,420px)_1fr] sm:items-center">
          <div className="relative h-[480px]">
            {t.aproposPhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={t.aproposPhoto} alt={t.aproposTitre} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-[var(--blush)] via-[#cbb39d] to-[#a98c72] text-center text-sm italic text-[var(--noir)]/60">
                Portrait de la fondatrice
              </div>
            )}
            <div className="pointer-events-none absolute inset-4 border border-[var(--noir)]/40" />
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-[var(--brass)]">{t.aproposKicker}</p>
            <h1 className="font-display mt-4 text-3xl uppercase tracking-[0.1em] sm:text-4xl">
              {t.aproposTitre}
            </h1>
            <p className="font-italic-serif mt-3 text-lg text-[var(--gris)]">{t.aproposRole}</p>

            {t.aproposCitation && (
              <p className="font-italic-serif mt-8 border-l-2 border-[var(--brass)] pl-5 text-xl leading-relaxed">
                &laquo; {t.aproposCitation} &raquo;
              </p>
            )}

            <Link
              href="/academy"
              className="mt-8 inline-block border border-[var(--noir)] px-6 py-3 text-xs uppercase tracking-[0.14em] hover:bg-[var(--noir)] hover:text-[var(--porcelaine)]"
            >
              Découvrir l&apos;Academy
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--ligne)] bg-white py-24">
        <div className="mx-auto max-w-2xl px-6">
          <div className="flex flex-col gap-6 text-[var(--gris)]">
            {[t.aproposBio1, t.aproposBio2, t.aproposBio3].filter(Boolean).map((paragraphe, i) => (
              <p key={i} className="leading-relaxed">
                {paragraphe}
              </p>
            ))}
          </div>
          {t.aproposSignature && (
            <p className="font-italic-serif mt-10 text-2xl">{t.aproposSignature}</p>
          )}
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-14 text-center">
            <div className="font-display inline-block border border-[var(--noir)] px-8 py-3 text-lg uppercase tracking-[0.2em]">
              Nos valeurs
            </div>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              { titre: "Exigence", texte: "Chaque prestation et chaque formation répond à un standard professionnel exigeant." },
              { titre: "Transmission", texte: "Former la nouvelle génération de maquilleuses, techniques et créatives." },
              { titre: "Authenticité", texte: "Sublimer chaque carnation, chaque style, chaque histoire." },
            ].map((v) => (
              <div key={v.titre} className="border border-[var(--noir)] p-8 text-center">
                <h3 className="font-display text-sm uppercase tracking-[0.14em]">{v.titre}</h3>
                <p className="mt-4 text-sm text-[var(--gris)]">{v.texte}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
