import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { createLecon, updateLecon, deleteLecon } from "@/lib/actions/admin";

export const metadata = { title: "Modules — Administration" };

export default async function AdminModulesPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ maj?: string; erreur?: string }>;
}) {
  const session = await verifySession();
  if (!session) redirect("/connexion");
  if (session.role !== "ADMIN") redirect("/admin");
  const { id } = await params;
  const { maj, erreur } = await searchParams;

  const formation = await prisma.formation.findUnique({
    where: { id },
    include: { lecons: { orderBy: { ordre: "asc" } } },
  });
  if (!formation) notFound();

  const prochainOrdre = (formation.lecons.at(-1)?.ordre ?? 0) + 1;

  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <p className="text-xs uppercase tracking-[0.1em] text-[var(--brass)]">
        <Link href={`/admin/formations/${id}`}>&larr; {formation.titre}</Link>
      </p>
      <h1 className="font-display mt-3 text-2xl uppercase tracking-[0.12em]">Modules de la formation</h1>

      {maj === "ok" && (
        <p className="mt-4 border border-[var(--brass)] bg-[var(--blush)] px-4 py-3 text-sm">
          Module mis a jour.
        </p>
      )}
      {erreur === "suppression" && (
        <p className="mt-4 border border-red-700 bg-red-50 px-4 py-3 text-sm text-red-700">
          Impossible de supprimer ce module : des eleves y ont deja progresse.
        </p>
      )}

      <ul className="mt-8 flex flex-col gap-4">
        {formation.lecons.map((lecon) => (
          <li key={lecon.id} className="border border-[var(--noir)] bg-white p-5">
            <form action={updateLecon.bind(null, id, lecon.id)} className="flex flex-col gap-3">
              <div className="flex gap-3">
                <div className="w-20">
                  <label className="text-xs uppercase tracking-[0.1em]">Ordre</label>
                  <input name="ordre" type="number" defaultValue={lecon.ordre} className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
                </div>
                <div className="flex-1">
                  <label className="text-xs uppercase tracking-[0.1em]">Titre</label>
                  <input name="titre" defaultValue={lecon.titre} required className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.1em]">Video (URL)</label>
                <input name="videoUrl" defaultValue={lecon.videoUrl ?? ""} placeholder="https://..." className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.1em]">Support PDF (URL)</label>
                <input name="pdfUrl" defaultValue={lecon.pdfUrl ?? ""} placeholder="https://..." className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="border border-[var(--noir)] px-4 py-2 text-xs uppercase tracking-[0.1em] hover:bg-[var(--noir)] hover:text-[var(--porcelaine)]">
                  Enregistrer
                </button>
              </div>
            </form>
            <form action={deleteLecon.bind(null, id, lecon.id)} className="mt-2">
              <button type="submit" className="text-xs uppercase tracking-[0.1em] text-red-700">
                Supprimer le module
              </button>
            </form>
          </li>
        ))}
        {formation.lecons.length === 0 && (
          <p className="text-sm text-[var(--gris)]">Aucun module pour le moment.</p>
        )}
      </ul>

      <h2 className="mt-14 font-display text-sm uppercase tracking-[0.12em]">Ajouter un module</h2>
      <form action={createLecon.bind(null, id)} className="mt-4 flex flex-col gap-3 border border-[var(--ligne)] bg-white p-5">
        <div className="flex gap-3">
          <div className="w-20">
            <label className="text-xs uppercase tracking-[0.1em]">Ordre</label>
            <input name="ordre" type="number" defaultValue={prochainOrdre} className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
          </div>
          <div className="flex-1">
            <label className="text-xs uppercase tracking-[0.1em]">Titre</label>
            <input name="titre" required placeholder="ex: Preparer la peau" className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
          </div>
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.1em]">Video (URL)</label>
          <input name="videoUrl" placeholder="https://..." className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.1em]">Support PDF (URL)</label>
          <input name="pdfUrl" placeholder="https://..." className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
        </div>
        <button type="submit" className="self-start border border-[var(--noir)] bg-[var(--noir)] px-6 py-3 text-xs uppercase tracking-[0.12em] text-[var(--porcelaine)]">
          Ajouter le module
        </button>
      </form>
    </section>
  );
}
