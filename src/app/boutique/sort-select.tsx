"use client";

import { useRouter, useSearchParams } from "next/navigation";

const OPTIONS = [
  { value: "recent", label: "Nouveautes" },
  { value: "prix-asc", label: "Prix croissant" },
  { value: "prix-desc", label: "Prix decroissant" },
  { value: "nom", label: "Nom (A-Z)" },
];

export default function SortSelect({ tri }: { tri: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <select
      value={tri}
      onChange={(e) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("tri", e.target.value);
        router.push(`/boutique?${params.toString()}`);
      }}
      className="border border-[var(--noir)] bg-white px-3 py-2 text-xs uppercase tracking-[0.1em]"
      aria-label="Trier par"
    >
      {OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
