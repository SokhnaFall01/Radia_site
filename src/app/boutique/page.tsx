import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSiteTextes } from "@/lib/contenuTextes";
import { ajouterAuPanier } from "@/lib/actions/cart";
import SortSelect from "./sort-select";
import type { Prisma } from "@/generated/prisma/client";

export const metadata = { title: "Boutique — Radia Glam" };

const ORDER_BY: Record<string, Prisma.ProduitOrderByWithRelationInput> = {
  recent: { createdAt: "desc" },
  "prix-asc": { prixFcfa: "asc" },
  "prix-desc": { prixFcfa: "desc" },
  nom: { nom: "asc" },
};

export default async function BoutiquePage({
  searchParams,
}: {
  searchParams: Promise<{ categorie?: string; tri?: string }>;
}) {
  const { categorie, tri } = await searchParams;
  const triActif = tri && ORDER_BY[tri] ? tri : "recent";

  const [t, produits, categoriesBrutes] = await Promise.all([
    getSiteTextes(),
    prisma.produit.findMany({
      where: categorie ? { categorie } : undefined,
      orderBy: ORDER_BY[triActif],
    }),
    prisma.produit.findMany({ distinct: ["categorie"], select: { categorie: true } }),
  ]);
  const categories = categoriesBrutes.map((c) => c.categorie).sort();

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <h1 className="font-display text-2xl uppercase tracking-[0.12em]">{t.boutiqueTitre}</h1>
      <p className="mt-4 text-[var(--gris)]">{t.boutiqueIntro}</p>

      {categories.length > 0 && (
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-b border-[var(--ligne)] pb-6">
          <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.1em]">
            <Link
              href="/boutique"
              className={`border px-4 py-2 ${!categorie ? "border-[var(--noir)] bg-[var(--noir)] text-[var(--porcelaine)]" : "border-[var(--ligne)] hover:border-[var(--noir)]"}`}
            >
              Tout
            </Link>
            {categories.map((c) => (
              <Link
                key={c}
                href={`/boutique?categorie=${encodeURIComponent(c)}${triActif !== "recent" ? `&tri=${triActif}` : ""}`}
                className={`border px-4 py-2 ${categorie === c ? "border-[var(--noir)] bg-[var(--noir)] text-[var(--porcelaine)]" : "border-[var(--ligne)] hover:border-[var(--noir)]"}`}
              >
                {c}
              </Link>
            ))}
          </div>
          <SortSelect tri={triActif} />
        </div>
      )}

      {produits.length === 0 ? (
        <p className="mt-10 text-sm text-[var(--gris)]">
          {categorie
            ? "Aucun produit dans cette catégorie pour le moment."
            : "Aucun produit disponible pour le moment. Ajoutez-en depuis le tableau de bord admin."}
        </p>
      ) : (
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {produits.map((produit) => {
            const enRupture = produit.stock <= 0;
            const stockFaible = !enRupture && produit.stock <= produit.seuilAlerte;

            return (
              <div key={produit.id} className="group border border-[var(--ligne)] bg-white transition-shadow hover:shadow-lg">
                <div className="relative h-56 overflow-hidden bg-[var(--blush)]">
                  {produit.photos[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={produit.photos[0]}
                      alt={produit.nom}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#f0e6dc] to-[#d9c0a8] text-sm italic text-[var(--noir)]/50">
                      Photo à venir
                    </div>
                  )}
                  <span className="absolute left-3 top-3 bg-[var(--porcelaine)] px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-[var(--brass)]">
                    {produit.categorie}
                  </span>
                  {enRupture && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[var(--noir)]/60">
                      <span className="border border-[var(--porcelaine)] px-4 py-2 text-xs uppercase tracking-[0.14em] text-[var(--porcelaine)]">
                        Rupture de stock
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h2 className="font-display text-sm uppercase tracking-[0.1em]">{produit.nom}</h2>
                  <p className="font-italic-serif mt-2 text-lg text-[var(--brass)]">
                    {produit.prixFcfa.toLocaleString("fr-FR")} FCFA
                  </p>

                  {!enRupture && (
                    <form action={ajouterAuPanier.bind(null, produit.id)} className="mt-4 flex gap-2">
                      <input
                        type="number"
                        name="quantite"
                        min={1}
                        max={produit.stock}
                        defaultValue={1}
                        className="w-16 border border-[var(--noir)] px-2 py-2 text-sm"
                      />
                      <button
                        type="submit"
                        className="flex-1 border border-[var(--noir)] bg-[var(--noir)] px-3 py-2 text-xs uppercase tracking-[0.1em] text-[var(--porcelaine)] hover:bg-transparent hover:text-[var(--noir)]"
                      >
                        Ajouter au panier
                      </button>
                    </form>
                  )}
                  {stockFaible && (
                    <p className="mt-2 text-xs uppercase tracking-[0.1em] text-[var(--brass)]">
                      Plus que {produit.stock} en stock
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
