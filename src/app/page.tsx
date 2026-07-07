import Link from "next/link";
import { prisma } from "@/lib/db";
import { ajouterAuPanier } from "@/lib/actions/cart";

const TEMOIGNAGES = [
  { texte: "Une equipe passionnee, un resultat au-dela de mes attentes le jour de mon mariage.", qui: "Fatou S." },
  { texte: "La formation intensive a change ma carriere. Aujourd'hui je vis de mon art.", qui: "Aissatou K., diplomee 2026" },
  { texte: "Un salon elegant, une ecoute rare. Je ne vais plus nulle part ailleurs.", qui: "Bineta D." },
];

export default async function Home() {
  const [prestations, formations, produits] = await Promise.all([
    prisma.prestation.findMany({ where: { actif: true }, orderBy: { nom: "asc" }, take: 3 }),
    prisma.formation.findMany({ where: { publie: true }, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.produit.findMany({ orderBy: { createdAt: "desc" }, take: 4 }),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 py-28 text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-[var(--brass)]">
          Salon · Academy · Boutique
        </p>
        <h1 className="font-display mt-7 text-4xl uppercase tracking-[0.1em] sm:text-6xl">
          Revelez votre eclat
        </h1>
        <p className="font-italic-serif mt-3 text-xl text-[var(--gris)] sm:text-2xl">
          L&apos;art de la beaute, signe Radia Glam
        </p>
        <p className="mx-auto mt-8 max-w-lg text-[var(--gris)]">
          Un espace dedie a la beaute haut de gamme : prestations sur mesure en salon, formations
          professionnelles certifiantes et une boutique pensee pour sublimer chaque geste.
        </p>
        <div className="mt-11 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/reservation"
            className="border border-[var(--noir)] bg-[var(--noir)] px-8 py-4 text-xs uppercase tracking-[0.18em] text-[var(--porcelaine)]"
          >
            Reserver une prestation
          </Link>
          <Link
            href="/academy"
            className="border border-[var(--noir)] px-8 py-4 text-xs uppercase tracking-[0.18em]"
          >
            S&apos;inscrire a une formation
          </Link>
        </div>
      </section>

      {/* Prestations */}
      <section id="prestations" className="border-t border-[var(--ligne)] bg-white py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <div className="font-display inline-block border border-[var(--noir)] px-8 py-3 text-lg uppercase tracking-[0.2em]">
              Nos prestations
            </div>
            <p className="font-italic-serif mt-4 text-lg text-[var(--brass)]">
              Le salon, une experience sur mesure
            </p>
          </div>

          {prestations.length === 0 ? (
            <p className="mt-12 text-center text-sm text-[var(--gris)]">
              Les prestations seront bientot disponibles.
            </p>
          ) : (
            <div className="mt-14 grid gap-8 sm:grid-cols-3">
              {prestations.map((p) => (
                <div key={p.id} className="border border-[var(--ligne)]">
                  {p.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.photo} alt={p.nom} className="h-52 w-full object-cover" />
                  ) : (
                    <div className="flex h-52 items-center justify-center bg-gradient-to-br from-[var(--blush)] to-[#c9a98f] text-sm italic text-[var(--noir)]/50">
                      Photo a venir
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-sm uppercase tracking-[0.14em]">{p.nom}</h3>
                    <p className="font-italic-serif mt-4 text-lg text-[var(--brass)]">
                      A partir de {p.prixFcfa.toLocaleString("fr-FR")} FCFA
                    </p>
                    <Link
                      href="/reservation"
                      className="mt-4 inline-block border-b border-[var(--brass)] text-xs uppercase tracking-[0.14em]"
                    >
                      Reserver
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Academy */}
      <section id="academy" className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <div className="font-display inline-block border border-[var(--noir)] px-8 py-3 text-lg uppercase tracking-[0.2em]">
              Radia Glam Academy
            </div>
            <p className="font-italic-serif mt-4 text-lg text-[var(--brass)]">Nos formations</p>
          </div>

          {formations.length === 0 ? (
            <p className="text-center text-sm text-[var(--gris)]">
              Le catalogue de formations sera bientot disponible.
            </p>
          ) : (
            <div className="flex gap-6 overflow-x-auto pb-4">
              {formations.map((f) => (
                <div key={f.id} className="w-72 shrink-0">
                  {f.photos[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={f.photos[0]} alt={f.titre} className="h-72 w-full object-cover" />
                  ) : (
                    <div className="flex h-72 items-center justify-center bg-gradient-to-br from-[#d9c4b2] to-[#8f6f55] text-sm italic text-white/70">
                      Photo a venir
                    </div>
                  )}
                  <div className="mt-3 flex items-center justify-center gap-3 bg-[var(--blush)] py-3 text-xs uppercase tracking-[0.06em]">
                    <span>{f.duree}</span>
                    <span>·</span>
                    <span>{f.niveau}</span>
                  </div>
                  <h3 className="mt-4 text-sm uppercase tracking-[0.08em]">{f.titre}</h3>
                  <p className="mt-2 text-sm text-[var(--gris)]">{f.description}</p>
                  <Link
                    href="/academy"
                    className="mt-4 inline-block bg-[var(--blush)] px-6 py-3 text-xs uppercase tracking-[0.14em] hover:bg-[var(--noir)] hover:text-[var(--porcelaine)]"
                  >
                    Decouvrir
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Temoignages */}
      <section className="border-t border-[var(--ligne)] bg-white py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-14 text-center">
            <div className="font-display inline-block border border-[var(--noir)] px-8 py-3 text-lg uppercase tracking-[0.2em]">
              Temoignages
            </div>
            <p className="font-italic-serif mt-4 text-lg text-[var(--brass)]">
              Elles nous font confiance
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {TEMOIGNAGES.map((t) => (
              <div key={t.qui} className="border border-[var(--noir)] p-8">
                <p className="font-italic-serif text-lg leading-relaxed">&laquo; {t.texte} &raquo;</p>
                <p className="mt-5 text-xs uppercase tracking-[0.14em] text-[var(--brass)]">
                  — {t.qui}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Galerie */}
      <section id="galerie" className="py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-14 text-center">
            <div className="font-display inline-block border border-[var(--noir)] px-8 py-3 text-lg uppercase tracking-[0.2em]">
              Galerie
            </div>
            <p className="font-italic-serif mt-4 text-lg text-[var(--brass)]">
              Realisations du salon &amp; travaux des eleves
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {["Avant / Apres", "Mariee", "Eleves en formation", "Shooting editorial"].map((label) => (
              <div
                key={label}
                className="flex h-56 items-center justify-center bg-gradient-to-br from-[var(--blush)] to-[#b08f71] text-center text-sm italic text-[var(--noir)]/60"
              >
                {label}
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/galerie" className="border-b border-[var(--brass)] text-xs uppercase tracking-[0.14em]">
              Voir toute la galerie
            </Link>
          </div>
        </div>
      </section>

      {/* A propos */}
      <section id="apropos" className="border-t border-[var(--ligne)] bg-white py-24">
        <div className="mx-auto grid max-w-5xl gap-14 px-6 sm:grid-cols-[minmax(240px,380px)_1fr] sm:items-center">
          <div className="relative h-96 bg-gradient-to-br from-[var(--blush)] via-[#cbb39d] to-[#a98c72]">
            <div className="absolute inset-4 border border-[var(--noir)]/50" />
            <div className="flex h-full items-center justify-center text-center text-sm italic text-[var(--noir)]/60">
              Portrait de la fondatrice
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-[var(--brass)]">A propos</p>
            <h2 className="font-display mt-4 text-2xl uppercase tracking-[0.1em] sm:text-3xl">
              La femme derriere Radia Glam
            </h2>
            <p className="font-italic-serif mt-2 text-lg text-[var(--gris)]">
              Fondatrice · Maquilleuse professionnelle &amp; formatrice
            </p>
            <p className="mt-6 max-w-lg text-[var(--gris)]">
              Passionnee par l&apos;art de la beaute depuis toujours, la fondatrice a cree Radia
              Glam avec une conviction : chaque femme merite de reveler son eclat. Aujourd&apos;hui,
              Radia Glam c&apos;est un salon, une academy et une boutique — un univers complet pense
              pour sublimer et elever.
            </p>
            <Link
              href="/a-propos"
              className="mt-8 inline-block border border-[var(--noir)] px-6 py-3 text-xs uppercase tracking-[0.14em] hover:bg-[var(--noir)] hover:text-[var(--porcelaine)]"
            >
              En savoir plus
            </Link>
          </div>
        </div>
      </section>

      {/* Boutique */}
      <section id="boutique" className="py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-14 text-center">
            <div className="font-display inline-block border border-[var(--noir)] px-8 py-3 text-lg uppercase tracking-[0.2em]">
              Boutique Radia Glam
            </div>
            <p className="font-italic-serif mt-4 text-lg text-[var(--brass)]">
              Nos essentiels, selectionnes avec exigence
            </p>
          </div>

          {produits.length === 0 ? (
            <p className="text-center text-sm text-[var(--gris)]">
              La boutique sera bientot disponible.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {produits.map((produit) => {
                const enRupture = produit.stock <= 0;
                return (
                  <div key={produit.id} className="border border-[var(--ligne)] bg-white text-center">
                    {produit.photos[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={produit.photos[0]} alt={produit.nom} className="h-44 w-full object-cover" />
                    ) : (
                      <div className="flex h-44 items-center justify-center bg-gradient-to-br from-[#f0e6dc] to-[#d9c0a8] text-sm italic text-[var(--noir)]/50">
                        Photo produit
                      </div>
                    )}
                    <div className="p-5">
                      <p className="text-xs uppercase tracking-[0.2em] text-[var(--brass)]">
                        {produit.categorie}
                      </p>
                      <h3 className="mt-1 text-sm uppercase tracking-[0.1em]">{produit.nom}</h3>
                      <p className="font-italic-serif my-3 text-lg">
                        {produit.prixFcfa.toLocaleString("fr-FR")} FCFA
                      </p>
                      {enRupture ? (
                        <p className="text-xs uppercase tracking-[0.1em] text-red-700">
                          Rupture de stock
                        </p>
                      ) : (
                        <form action={ajouterAuPanier.bind(null, produit.id)}>
                          <input type="hidden" name="quantite" value="1" />
                          <button
                            type="submit"
                            className="border border-[var(--noir)] px-5 py-2.5 text-xs uppercase tracking-[0.14em] hover:bg-[var(--noir)] hover:text-[var(--porcelaine)]"
                          >
                            Ajouter au panier
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div className="mt-12 text-center">
            <Link
              href="/boutique"
              className="border border-[var(--noir)] px-8 py-3 text-xs uppercase tracking-[0.18em] hover:bg-[var(--noir)] hover:text-[var(--porcelaine)]"
            >
              Voir toute la boutique
            </Link>
          </div>
        </div>
      </section>

      {/* Reservation banner */}
      <section id="resa" className="bg-[var(--blush)] py-24 text-center">
        <h2 className="font-display text-2xl uppercase tracking-[0.16em] sm:text-4xl">
          Reservez votre moment
        </h2>
        <p className="mx-auto mt-5 max-w-lg text-[var(--gris)]">
          Choisissez votre prestation, votre artiste et votre creneau. Confirmation immediate,
          acompte securise en ligne.
        </p>
        <Link
          href="/reservation"
          className="mt-9 inline-block border border-[var(--noir)] bg-[var(--noir)] px-8 py-4 text-xs uppercase tracking-[0.18em] text-[var(--porcelaine)]"
        >
          Prendre rendez-vous
        </Link>
      </section>
    </div>
  );
}
