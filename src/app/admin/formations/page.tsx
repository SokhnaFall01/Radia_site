import Link from "next/link";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { createFormation } from "@/lib/actions/admin";

export const metadata = { title: "Formations — Administration" };

export default async function AdminFormationsPage({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string }>;
}) {
  const session = await verifySession();
  if (!session) redirect("/connexion");
  if (session.role !== "ADMIN") redirect("/admin");
  const { erreur } = await searchParams;

  const formations = await prisma.formation.findMany({
    include: { sessions: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <section className="mx-auto max-w-4xl px-6 py-20">
      <p className="text-xs uppercase tracking-[0.1em] text-[var(--brass)]">
        <Link href="/admin">&larr; Tableau de bord</Link>
      </p>
      <h1 className="font-display mt-3 text-2xl uppercase tracking-[0.12em]">Formations</h1>

      {erreur === "suppression" && (
        <p className="mt-4 border border-red-700 bg-red-50 px-4 py-3 text-sm text-red-700">
          Impossible de supprimer cette formation : des sessions ou inscriptions y sont liees.
        </p>
      )}

      <ul className="mt-8 flex flex-col gap-3">
        {formations.map((f) => (
          <li key={f.id} className="flex items-center justify-between border border-[var(--ligne)] bg-white p-4 text-sm">
            <div>
              <Link href={`/admin/formations/${f.id}`} className="font-medium hover:text-[var(--brass)]">
                {f.titre}
              </Link>
              <p className="text-[var(--gris)]">
                {f.tarifFcfa.toLocaleString("fr-FR")} FCFA · {f.duree} · {f.niveau} ·{" "}
                {f.sessions.length} session(s)
              </p>
            </div>
            <span className="text-xs uppercase tracking-[0.1em] text-[var(--brass)]">
              {f.publie ? "Publiee" : "Brouillon"}
            </span>
          </li>
        ))}
        {formations.length === 0 && (
          <p className="text-sm text-[var(--gris)]">Aucune formation pour le moment.</p>
        )}
      </ul>

      <h2 className="mt-14 font-display text-sm uppercase tracking-[0.12em]">Ajouter une formation</h2>
      <form action={createFormation} className="mt-6 flex flex-col gap-4">
        <div>
          <label className="text-xs uppercase tracking-[0.1em]" htmlFor="titre">Titre</label>
          <input id="titre" name="titre" required className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.1em]" htmlFor="description">Description</label>
          <textarea id="description" name="description" required rows={3} className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.1em]" htmlFor="programme">Programme</label>
          <textarea id="programme" name="programme" required rows={3} className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-xs uppercase tracking-[0.1em]" htmlFor="duree">Duree</label>
            <input id="duree" name="duree" required placeholder="ex: 2 jours" className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.1em]" htmlFor="niveau">Niveau</label>
            <input id="niveau" name="niveau" required placeholder="ex: Debutant" className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.1em]" htmlFor="tarifFcfa">Tarif (FCFA)</label>
            <input id="tarifFcfa" name="tarifFcfa" type="number" min={0} required className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="publie" />
          Publier immediatement (visible sur /academy)
        </label>
        <button
          type="submit"
          className="mt-2 self-start border border-[var(--noir)] bg-[var(--noir)] px-6 py-3 text-xs uppercase tracking-[0.12em] text-[var(--porcelaine)]"
        >
          Creer la formation
        </button>
      </form>
    </section>
  );
}
