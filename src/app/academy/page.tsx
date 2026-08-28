import Link from "next/link";
import { prisma } from "@/lib/db";

export const metadata = { title: "Academy — Radia Glam" };

const CATEGORIES: { cle: "MAQUILLAGE" | "PERFECTIONNEMENT" | "BUSINESS" | "MASTERCLASS"; titre: string; emoji: string; sousTitre: string }[] = [
  { cle: "MAQUILLAGE", titre: "Maquillage", emoji: "💄", sousTitre: "Apprendre ou perfectionner les techniques." },
  { cle: "PERFECTIONNEMENT", titre: "Perfectionnement", emoji: "✨", sousTitre: "Pour celles qui maitrisent deja les bases." },
  { cle: "BUSINESS", titre: "Business", emoji: "💼", sousTitre: "Vivre de son metier de maquilleuse." },
  { cle: "MASTERCLASS", titre: "Masterclass", emoji: "👑", sousTitre: "Des formations premium, plus poussees." },
];

type FormationCarte = {
  id: string;
  titre: string;
  description: string;
  tarifFcfa: number;
  dureeVideo: string | null;
  photos: string[];
  _count: { lecons: number };
};

function Carte({ formation }: { formation: FormationCarte }) {
  const nbModules = formation._count.lecons;
  const meta: string[] = [];
  if (nbModules > 0) meta.push(`${nbModules} module${nbModules > 1 ? "s" : ""}`);
  if (formation.dureeVideo) meta.push(formation.dureeVideo);
  meta.push("Accès immédiat");

  return (
    <Link
      href={`/academy/${formation.id}`}
      className="group flex flex-col border border-[var(--noir)] bg-white transition hover:shadow-lg"
    >
      {formation.photos[0] ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={formation.photos[0]} alt={formation.titre} className="h-48 w-full object-cover" />
      ) : (
        <div className="flex h-48 items-center justify-center bg-gradient-to-br from-[var(--blush)] to-[#c9a98f] text-sm italic text-[var(--noir)]/50">
          Photo a venir
        </div>
      )}
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-sm uppercase tracking-[0.1em] group-hover:text-[var(--brass)]">
          {formation.titre}
        </h3>
        <p className="mt-2 flex-1 text-sm text-[var(--gris)]">{formation.description}</p>
        <p className="mt-4 text-xs uppercase tracking-[0.1em] text-[var(--brass)]">{meta.join(" • ")}</p>
        <p className="mt-2 font-display text-sm">{formation.tarifFcfa.toLocaleString("fr-FR")} FCFA</p>
      </div>
    </Link>
  );
}

export default async function AcademyPage() {
  const formations = await prisma.formation.findMany({
    where: { publie: true, mode: "EN_LIGNE" },
    include: { _count: { select: { lecons: true } } },
    orderBy: [{ ordreAffichage: "asc" }, { createdAt: "desc" }],
  });

  const parCategorie = new Map<string, FormationCarte[]>();
  for (const f of formations) {
    const list = parCategorie.get(f.categorie) ?? [];
    list.push(f);
    parCategorie.set(f.categorie, list);
  }

  return (
    <div className="pb-24">
      {/* Hero */}
      <section className="bg-[var(--noir)] text-[var(--porcelaine)]">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <h1 className="font-display text-3xl uppercase tracking-[0.14em] sm:text-4xl">
            Radia Glam Academy
          </h1>
          <p className="mt-4 font-italic-serif text-lg text-[var(--brass)]">
            Apprenez l&apos;art du maquillage avec la methode Radiaglam.
          </p>
          <p className="mx-auto mt-6 max-w-2xl text-[var(--porcelaine)]/80">
            Des formations professionnelles pensees pour vous permettre d&apos;apprendre, de vous
            perfectionner et de developper votre activite, a votre rythme.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4 text-xs uppercase tracking-[0.12em]">
            <a href="#formations" className="border border-[var(--brass)] bg-[var(--brass)] px-6 py-3 text-[var(--noir)]">
              Decouvrir les formations
            </a>
            <Link href="/espace/formations" className="border border-[var(--porcelaine)] px-6 py-3 hover:bg-[var(--porcelaine)] hover:text-[var(--noir)]">
              Voir mes formations
            </Link>
            <Link href="/academy/presentiel" className="border border-[var(--porcelaine)] px-6 py-3 hover:bg-[var(--porcelaine)] hover:text-[var(--noir)]">
              Formations en presentiel
            </Link>
          </div>
        </div>
      </section>

      <div id="formations" className="mx-auto max-w-5xl px-6">
        {formations.length === 0 ? (
          <p className="mt-16 text-center text-sm text-[var(--gris)]">
            Le catalogue de formations sera bientot disponible.
          </p>
        ) : (
          CATEGORIES.map((cat) => {
            const items = parCategorie.get(cat.cle) ?? [];
            if (items.length === 0) return null;
            return (
              <section key={cat.cle} id={cat.cle.toLowerCase()} className="mt-16 scroll-mt-24">
                <div className="border-b border-[var(--ligne)] pb-4">
                  <h2 className="font-display text-xl uppercase tracking-[0.12em]">
                    <span className="mr-2">{cat.emoji}</span>
                    {cat.titre}
                  </h2>
                  <p className="mt-1 text-sm text-[var(--gris)]">{cat.sousTitre}</p>
                </div>
                <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((formation) => (
                    <Carte key={formation.id} formation={formation} />
                  ))}
                </div>
              </section>
            );
          })
        )}

        {formations.length > 0 && (
          <section className="mt-20 border border-[var(--noir)] bg-[var(--noir)] p-10 text-center text-[var(--porcelaine)]">
            <p className="text-3xl">👑</p>
            <h2 className="font-display mt-3 text-xl uppercase tracking-[0.12em]">
              Radiaglam Academy Pass
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-[var(--porcelaine)]/80">
              Accedez a toutes les formations en ligne avec un seul acces. La meilleure facon de
              progresser sans limite.
            </p>
            <Link
              href="/academy/pass"
              className="mt-6 inline-block border border-[var(--brass)] bg-[var(--brass)] px-8 py-3 text-xs uppercase tracking-[0.14em] text-[var(--noir)] hover:opacity-90"
            >
              Decouvrir le Pass
            </Link>
          </section>
        )}
      </div>
    </div>
  );
}
