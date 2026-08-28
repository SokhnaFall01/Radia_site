"use client";

import { useState } from "react";
import Link from "next/link";
import type { NavItem } from "@/components/mobile-nav";

export default function SiteNav({ navLinks }: { navLinks: NavItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <nav className="hidden gap-8 text-xs tracking-[0.1em] uppercase md:flex">
      {navLinks.map((link, i) =>
        link.children ? (
          <div
            key={link.href}
            className="relative"
            onMouseEnter={() => setOpenIndex(i)}
            onMouseLeave={() => setOpenIndex((cur) => (cur === i ? null : cur))}
          >
            <Link
              href={link.href}
              className="flex items-center gap-1 hover:text-[var(--brass)]"
              aria-haspopup="true"
              aria-expanded={openIndex === i}
            >
              {link.label}
              <span aria-hidden="true" className="text-[0.6rem]">▾</span>
            </Link>
            {openIndex === i && (
              <div className="absolute left-0 top-full z-50 min-w-52 border border-[var(--ligne)] bg-[var(--porcelaine)] py-2 shadow-lg">
                {link.children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    onClick={() => setOpenIndex(null)}
                    className="block px-4 py-2.5 text-[var(--gris)] hover:bg-[var(--blush)] hover:text-[var(--noir)]"
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ) : (
          <Link key={link.href} href={link.href} className="hover:text-[var(--brass)]">
            {link.label}
          </Link>
        ),
      )}
    </nav>
  );
}
