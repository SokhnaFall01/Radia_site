"use client";

import { useState } from "react";
import Link from "next/link";

export default function MobileNav({ navLinks }: { navLinks: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        aria-expanded={open}
        className="flex h-8 w-8 flex-col items-center justify-center gap-1.5"
      >
        <span className={`block h-px w-6 bg-[var(--noir)] transition-transform ${open ? "translate-y-2 rotate-45" : ""}`} />
        <span className={`block h-px w-6 bg-[var(--noir)] transition-opacity ${open ? "opacity-0" : ""}`} />
        <span className={`block h-px w-6 bg-[var(--noir)] transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`} />
      </button>

      {open && (
        <nav className="absolute left-0 right-0 top-full z-50 flex flex-col border-b border-[var(--ligne)] bg-[var(--porcelaine)] px-6 py-4 text-xs uppercase tracking-[0.1em] shadow-lg">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="border-b border-[var(--ligne)] py-3 last:border-b-0 hover:text-[var(--brass)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
