import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/db";
import {
  updateFormation,
  deleteFormation,
  createFormationSession,
  deleteFormationSession,
} from "@/lib/actions/admin";

export default async function AdminFormationEditPage({
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
    include: { sessions: { orderBy: { dateDebut: "asc" } } },
  });
  if (!formation) notFound();

  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <p className="text-xs uppercase tracking-[0.1em] text-[var(--brass)]">
        <Link href="/admin/formations">&larr; Formations</Link>
      </p>
      <h1 className="font-display mt-3 text-2xl uppercase tracking-[0.12em]">{formation.titre}</h1>

      {maj === "ok" && (
        <p className="mt-4 border border-[var(--brass)] bg-[var(--blush)] px-4 py-3 text-sm">
          Formation mise a jour.
        </p>
      )}
      {erreur === "suppression" && (
        <p className="mt-4 border border-red-700 bg-red-50 px-4 py-3 text-sm text-red-700">
          Impossible de supprimer cette session : des inscriptions y sont liees.
        </p>
      )}

      {erreur === "photo" && (
        <p className="mt-4 border border-red-700 bg-red-50 px-4 py-3 text-sm text-red-700">
          Photo invalide (jpg/png/webp, 5 Mo max).
        </p>
      )}

      <form action={updateFormation.bind(null, id)} encType="multipart/form-data" className="mt-8 flex flex-col gap-4">
        <div>
          <label className="text-xs uppercase tracking-[0.1em]" htmlFor="titre">Titre</label>
          <input id="titre" name="titre" defaultValue={formation.titre} required className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.1em]" htmlFor="photo">Photo</label>
          {formation.photos[0] && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={formation.photos[0]} alt="" className="mt-2 h-28 w-28 object-cover" />
          )}
          <input id="photo" name="photo" type="file" accept="image/jpeg,image/png,image/webp" className="mt-2 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.1em]" htmlFor="description">Description</label>
          <textarea id="description" name="description" defaultValue={formation.description} required rows={3} className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.1em]" htmlFor="programme">Programme</label>
          <textarea id="programme" name="programme" defaultValue={formation.programme} required rows={3} className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-xs uppercase tracking-[0.1em]" htmlFor="duree">Duree</label>
            <input id="duree" name="duree" defaultValue={formation.duree} required className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.1em]" htmlFor="niveau">Niveau</label>
            <input id="niveau" name="niveau" defaultValue={formation.niveau} required className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.1em]" htmlFor="tarifFcfa">Tarif (FCFA)</label>
            <input id="tarifFcfa" name="tarifFcfa" type="number" min={0} defaultValue={formation.tarifFcfa} required className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="publie" defaultChecked={formation.publie} />
          Publiee (visible sur /academy)
        </label>
        <button
          type="submit"
          className="mt-2 self-start border border-[var(--noir)] bg-[var(--noir)] px-6 py-3 text-xs uppercase tracking-[0.12em] text-[var(--porcelaine)]"
        >
          Enregistrer
        </button>
      </form>

      <form action={deleteFormation.bind(null, id)} className="mt-4">
        <button type="submit" className="border border-red-700 px-5 py-2.5 text-xs uppercase tracking-[0.1em] text-red-700">
          Supprimer la formation
        </button>
      </form>

      <h2 className="mt-14 font-display text-sm uppercase tracking-[0.12em]">Sessions</h2>
      <ul className="mt-4 flex flex-col gap-3">
        {formation.sessions.map((s) => (
          <li key={s.id} className="flex items-center justify-between border border-[var(--ligne)] bg-white p-4 text-sm">
            <div>
              <p>
                {s.dateDebut.toLocaleDateString("fr-FR")} &rarr; {s.dateFin.toLocaleDateString("fr-FR")}
              </p>
              <p className="text-[var(--gris)]">{s.placesRestantes} / {s.placesMax} places restantes</p>
            </div>
            <form action={deleteFormationSession.bind(null, id, s.id)}>
              <button type="submit" className="text-xs uppercase tracking-[0.1em] text-red-700">
                Supprimer
              </button>
            </form>
          </li>
        ))}
        {formation.sessions.length === 0 && (
          <p className="text-sm text-[var(--gris)]">Aucune session programmee.</p>
        )}
      </ul>

      <form action={createFormationSession.bind(null, id)} className="mt-6 flex flex-wrap items-end gap-4">
        <div>
          <label className="text-xs uppercase tracking-[0.1em]" htmlFor="dateDebut">Debut</label>
          <input id="dateDebut" name="dateDebut" type="date" required className="mt-1 border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.1em]" htmlFor="dateFin">Fin</label>
          <input id="dateFin" name="dateFin" type="date" required className="mt-1 border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.1em]" htmlFor="placesMax">Places</label>
          <input id="placesMax" name="placesMax" type="number" min={1} required defaultValue={10} className="mt-1 w-24 border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
        </div>
        <button
          type="submit"
          className="border border-[var(--noir)] px-5 py-2.5 text-xs uppercase tracking-[0.1em] hover:bg-[var(--noir)] hover:text-[var(--porcelaine)]"
        >
          Ajouter la session
        </button>
      </form>
    </section>
  );
}
