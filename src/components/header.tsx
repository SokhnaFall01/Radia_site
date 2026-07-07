import Link from "next/link";
import { getCurrentUser } from "@/lib/dal";
import { logout } from "@/lib/actions/auth";

const navLinks = [
  { href: "/", label: "Accueil" },
  { href: "/academy", label: "Academy" },
  { href: "/reservation", label: "Reservation" },
  { href: "/boutique", label: "Boutique" },
  { href: "/galerie", label: "Galerie" },
  { href: "/a-propos", label: "A propos" },
  { href: "/contact", label: "Contact" },
];

function UserIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20c1.5-4 5-6 7.5-6s6 2 7.5 6" strokeLinecap="round" />
    </svg>
  );
}

export default async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="border-b border-[var(--ligne)] bg-[var(--porcelaine)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="font-display text-sm tracking-[0.22em] uppercase">
          Radia Glam
        </Link>
        <nav className="hidden gap-8 text-xs tracking-[0.1em] uppercase md:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-[var(--brass)]">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4 text-xs uppercase tracking-[0.1em]">
          {user ? (
            <>
              <Link
                href={user.role === "CLIENTE" ? "/espace" : "/admin"}
                className="hover:text-[var(--brass)]"
                title="Mon compte"
                aria-label="Mon compte"
              >
                <UserIcon />
              </Link>
              <form action={logout}>
                <button type="submit" className="hover:text-[var(--brass)]">
                  Deconnexion
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/connexion"
                className="hover:text-[var(--brass)]"
                title="Connexion"
                aria-label="Connexion"
              >
                <UserIcon />
              </Link>
              <Link
                href="/inscription"
                className="border border-[var(--noir)] px-4 py-2 hover:bg-[var(--noir)] hover:text-[var(--porcelaine)]"
              >
                Creer un compte
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
