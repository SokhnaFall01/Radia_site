import Link from "next/link";
import { getCoordonnees } from "@/lib/contenu";

const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/academy", label: "Academy" },
  { href: "/reservation", label: "Réservation" },
  { href: "/boutique", label: "Boutique" },
  { href: "/galerie", label: "Galerie" },
  { href: "/a-propos", label: "À propos" },
  { href: "/contact", label: "Contact" },
];

export default async function Footer() {
  const c = await getCoordonnees();
  const hasSocial = c.instagram || c.tiktok || c.facebook;
  const hasContact = c.telephone || c.email || c.adresse;

  return (
    <footer className="border-t border-[var(--ligne)] bg-[var(--noir)] py-14 text-[var(--porcelaine)]">
      <div className="mx-auto grid max-w-5xl gap-10 px-6 text-sm sm:grid-cols-3">
        <div>
          <p className="font-display text-sm tracking-[0.22em] uppercase">Radia Glam</p>
          <p className="mt-2 text-xs uppercase tracking-[0.1em] text-white/60">Beauty &amp; Co.</p>
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-[0.16em] text-white/60">Navigation</h3>
          <ul className="mt-3 flex flex-col gap-2">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-[var(--brass)]">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-[0.16em] text-white/60">Contact</h3>
          {hasContact ? (
            <ul className="mt-3 flex flex-col gap-2">
              {c.telephone && <li>{c.telephone}</li>}
              {c.email && (
                <li>
                  <a href={`mailto:${c.email}`} className="hover:text-[var(--brass)]">
                    {c.email}
                  </a>
                </li>
              )}
              {c.adresse && <li>{c.adresse}</li>}
            </ul>
          ) : (
            <p className="mt-3 text-white/50">À venir</p>
          )}

          {hasSocial && (
            <ul className="mt-4 flex gap-4 text-xs uppercase tracking-[0.1em]">
              {c.instagram && (
                <li>
                  <a href={c.instagram} className="hover:text-[var(--brass)]">
                    Instagram
                  </a>
                </li>
              )}
              {c.tiktok && (
                <li>
                  <a href={c.tiktok} className="hover:text-[var(--brass)]">
                    TikTok
                  </a>
                </li>
              )}
              {c.facebook && (
                <li>
                  <a href={c.facebook} className="hover:text-[var(--brass)]">
                    Facebook
                  </a>
                </li>
              )}
            </ul>
          )}
        </div>
      </div>

      <p className="mt-12 text-center text-xs uppercase tracking-[0.14em] text-white/40">
        Radia Glam Beauty &amp; Co. — Dakar, Senegal
      </p>
    </footer>
  );
}
