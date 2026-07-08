import Link from "next/link";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { updateHoraires, createJourFerme, deleteJourFerme } from "@/lib/actions/admin";
import { JOURS } from "@/lib/horaires";

export const metadata = { title: "Horaires — Administration" };

export default async function AdminHorairesPage({
  searchParams,
}: {
  searchParams: Promise<{ maj?: string; erreur?: string }>;
}) {
  const session = await verifySession();
  if (!session) redirect("/connexion");
  if (session.role !== "ADMIN") redirect("/admin");
  const { maj, erreur } = await searchParams;

  const horaireRows = await prisma.horaireOuverture.findMany();
  const horaireByJour = new Map(horaireRows.map((h) => [h.jour, h]));
  const joursFermes = await prisma.jourFerme.findMany({ orderBy: { date: "asc" } });

  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <p className="text-xs uppercase tracking-[0.1em] text-[var(--brass)]">
        <Link href="/admin">&larr; Tableau de bord</Link>
      </p>
      <h1 className="font-display mt-3 text-2xl uppercase tracking-[0.12em]">
        Horaires d&apos;ouverture
      </h1>

      {maj === "ok" && (
        <p className="mt-4 border border-[var(--brass)] bg-[var(--blush)] px-4 py-3 text-sm">
          Horaires mis à jour.
        </p>
      )}
      {erreur === "doublon" && (
        <p className="mt-4 border border-red-700 bg-red-50 px-4 py-3 text-sm text-red-700">
          Ce jour est déjà marqué comme fermé.
        </p>
      )}

      <form action={updateHoraires} className="mt-8 flex flex-col gap-3">
        {JOURS.map((label, jour) => {
          const h = horaireByJour.get(jour);
          return (
            <div key={jour} className="flex items-center gap-4 border border-[var(--ligne)] bg-white p-4">
              <label className="flex w-32 items-center gap-2 text-sm capitalize">
                <input type="checkbox" name={`ouvert-${jour}`} defaultChecked={h?.ouvert ?? true} />
                {label}
              </label>
              <input
                type="time"
                name={`debut-${jour}`}
                defaultValue={h?.heureDebut ?? "09:00"}
                className="border border-[var(--noir)] bg-white px-3 py-2 text-sm"
              />
              <span className="text-sm">&agrave;</span>
              <input
                type="time"
                name={`fin-${jour}`}
                defaultValue={h?.heureFin ?? "18:00"}
                className="border border-[var(--noir)] bg-white px-3 py-2 text-sm"
              />
            </div>
          );
        })}
        <button
          type="submit"
          className="mt-2 self-start border border-[var(--noir)] bg-[var(--noir)] px-6 py-3 text-xs uppercase tracking-[0.12em] text-[var(--porcelaine)]"
        >
          Enregistrer les horaires
        </button>
      </form>

      <h2 className="mt-14 font-display text-sm uppercase tracking-[0.12em]">
        Conges &amp; jours feries
      </h2>
      <ul className="mt-4 flex flex-col gap-3">
        {joursFermes.map((j) => (
          <li key={j.id} className="flex items-center justify-between border border-[var(--ligne)] bg-white p-4 text-sm">
            <div>
              <p>{j.date.toLocaleDateString("fr-FR")}</p>
              {j.motif && <p className="text-[var(--gris)]">{j.motif}</p>}
            </div>
            <form action={deleteJourFerme.bind(null, j.id)}>
              <button type="submit" className="text-xs uppercase tracking-[0.1em] text-red-700">
                Supprimer
              </button>
            </form>
          </li>
        ))}
        {joursFermes.length === 0 && (
          <p className="text-sm text-[var(--gris)]">Aucun jour fermé exceptionnel.</p>
        )}
      </ul>

      <form action={createJourFerme} className="mt-6 flex flex-wrap items-end gap-4">
        <div>
          <label className="text-xs uppercase tracking-[0.1em]" htmlFor="date">Date</label>
          <input id="date" name="date" type="date" required className="mt-1 border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.1em]" htmlFor="motif">Motif (optionnel)</label>
          <input id="motif" name="motif" placeholder="ex: Tabaski" className="mt-1 border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
        </div>
        <button
          type="submit"
          className="border border-[var(--noir)] px-5 py-2.5 text-xs uppercase tracking-[0.1em] hover:bg-[var(--noir)] hover:text-[var(--porcelaine)]"
        >
          Ajouter
        </button>
      </form>
    </section>
  );
}
