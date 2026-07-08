import Link from "next/link";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { getSiteTextes } from "@/lib/contenuTextes";
import { updateSiteTextes, addPhotoGalerie, deletePhotoGalerie } from "@/lib/actions/admin";

export const metadata = { title: "Contenu du site — Administration" };

export default async function AdminContenuPage({
  searchParams,
}: {
  searchParams: Promise<{ maj?: string; erreur?: string }>;
}) {
  const session = await verifySession();
  if (!session) redirect("/connexion");
  if (session.role !== "ADMIN") redirect("/admin");
  const { maj, erreur } = await searchParams;

  const [t, photos] = await Promise.all([
    getSiteTextes(),
    prisma.photoGalerie.findMany({ orderBy: { ordre: "asc" } }),
  ]);

  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <p className="text-xs uppercase tracking-[0.1em] text-[var(--brass)]">
        <Link href="/admin">&larr; Tableau de bord</Link>
      </p>
      <h1 className="font-display mt-3 text-2xl uppercase tracking-[0.12em]">Contenu du site</h1>

      {maj === "ok" && (
        <p className="mt-4 border border-[var(--brass)] bg-[var(--blush)] px-4 py-3 text-sm">
          Contenu mis à jour.
        </p>
      )}
      {erreur === "photo" && (
        <p className="mt-4 border border-red-700 bg-red-50 px-4 py-3 text-sm text-red-700">
          Photo invalide (jpg/png/webp, 10 Mo max).
        </p>
      )}

      <form action={updateSiteTextes} className="mt-8 flex flex-col gap-10">
        <div>
          <h2 className="font-display text-sm uppercase tracking-[0.12em]">Accueil — Hero</h2>
          <div className="mt-4 flex flex-col gap-4">
            <div>
              <label className="text-xs uppercase tracking-[0.1em]" htmlFor="heroPhoto">
                Photo de couverture
              </label>
              {t.heroPhoto && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={t.heroPhoto} alt="" className="mt-2 h-32 w-full object-cover" />
              )}
              <input id="heroPhoto" name="heroPhoto" type="file" accept="image/jpeg,image/png,image/webp" className="mt-2 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.1em]" htmlFor="heroKicker">Kicker</label>
              <input id="heroKicker" name="heroKicker" defaultValue={t.heroKicker} className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.1em]" htmlFor="heroTitre">Titre</label>
              <input id="heroTitre" name="heroTitre" defaultValue={t.heroTitre} className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.1em]" htmlFor="heroSousTitre">Sous-titre</label>
              <input id="heroSousTitre" name="heroSousTitre" defaultValue={t.heroSousTitre} className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.1em]" htmlFor="heroTexte">Texte</label>
              <textarea id="heroTexte" name="heroTexte" rows={3} defaultValue={t.heroTexte} className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
            </div>
          </div>
        </div>

        <div>
          <h2 className="font-display text-sm uppercase tracking-[0.12em]">À propos — La fondatrice</h2>
          <div className="mt-4 flex flex-col gap-4">
            <div>
              <label className="text-xs uppercase tracking-[0.1em]" htmlFor="aproposPhoto">Portrait</label>
              {t.aproposPhoto && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={t.aproposPhoto} alt="" className="mt-2 h-32 w-32 object-cover" />
              )}
              <input id="aproposPhoto" name="aproposPhoto" type="file" accept="image/jpeg,image/png,image/webp" className="mt-2 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.1em]" htmlFor="aproposKicker">Kicker</label>
              <input id="aproposKicker" name="aproposKicker" defaultValue={t.aproposKicker} className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.1em]" htmlFor="aproposTitre">Titre</label>
              <input id="aproposTitre" name="aproposTitre" defaultValue={t.aproposTitre} className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.1em]" htmlFor="aproposRole">Rôle</label>
              <input id="aproposRole" name="aproposRole" defaultValue={t.aproposRole} className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.1em]" htmlFor="aproposCitation">Citation mise en avant</label>
              <textarea id="aproposCitation" name="aproposCitation" rows={2} defaultValue={t.aproposCitation} className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.1em]" htmlFor="aproposBio1">Paragraphe 1</label>
              <textarea id="aproposBio1" name="aproposBio1" rows={3} defaultValue={t.aproposBio1} className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.1em]" htmlFor="aproposBio2">Paragraphe 2</label>
              <textarea id="aproposBio2" name="aproposBio2" rows={3} defaultValue={t.aproposBio2} className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.1em]" htmlFor="aproposBio3">Paragraphe 3</label>
              <textarea id="aproposBio3" name="aproposBio3" rows={3} defaultValue={t.aproposBio3} className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.1em]" htmlFor="aproposSignature">Signature</label>
              <input id="aproposSignature" name="aproposSignature" defaultValue={t.aproposSignature} className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
            </div>
          </div>
        </div>

        <div>
          <h2 className="font-display text-sm uppercase tracking-[0.12em]">Page Academy</h2>
          <div className="mt-4 flex flex-col gap-4">
            <div>
              <label className="text-xs uppercase tracking-[0.1em]" htmlFor="academyTitre">Titre</label>
              <input id="academyTitre" name="academyTitre" defaultValue={t.academyTitre} className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.1em]" htmlFor="academyIntro">Texte d&apos;introduction</label>
              <textarea id="academyIntro" name="academyIntro" rows={2} defaultValue={t.academyIntro} className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
            </div>
          </div>
        </div>

        <div>
          <h2 className="font-display text-sm uppercase tracking-[0.12em]">Page Boutique</h2>
          <div className="mt-4 flex flex-col gap-4">
            <div>
              <label className="text-xs uppercase tracking-[0.1em]" htmlFor="boutiqueTitre">Titre</label>
              <input id="boutiqueTitre" name="boutiqueTitre" defaultValue={t.boutiqueTitre} className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.1em]" htmlFor="boutiqueIntro">Texte d&apos;introduction</label>
              <textarea id="boutiqueIntro" name="boutiqueIntro" rows={2} defaultValue={t.boutiqueIntro} className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
            </div>
          </div>
        </div>

        <div>
          <h2 className="font-display text-sm uppercase tracking-[0.12em]">Page Réservation</h2>
          <div className="mt-4 flex flex-col gap-4">
            <div>
              <label className="text-xs uppercase tracking-[0.1em]" htmlFor="reservationTitre">Titre</label>
              <input id="reservationTitre" name="reservationTitre" defaultValue={t.reservationTitre} className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.1em]" htmlFor="reservationIntro">Texte d&apos;introduction</label>
              <textarea id="reservationIntro" name="reservationIntro" rows={2} defaultValue={t.reservationIntro} className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
            </div>
          </div>
        </div>

        <div>
          <h2 className="font-display text-sm uppercase tracking-[0.12em]">Page Galerie</h2>
          <div className="mt-4 flex flex-col gap-4">
            <div>
              <label className="text-xs uppercase tracking-[0.1em]" htmlFor="galerieTitre">Titre</label>
              <input id="galerieTitre" name="galerieTitre" defaultValue={t.galerieTitre} className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.1em]" htmlFor="galerieIntro">Texte d&apos;introduction</label>
              <textarea id="galerieIntro" name="galerieIntro" rows={2} defaultValue={t.galerieIntro} className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
            </div>
          </div>
        </div>

        <div>
          <h2 className="font-display text-sm uppercase tracking-[0.12em]">Page Devis</h2>
          <div className="mt-4 flex flex-col gap-4">
            <div>
              <label className="text-xs uppercase tracking-[0.1em]" htmlFor="devisTitre">Titre</label>
              <input id="devisTitre" name="devisTitre" defaultValue={t.devisTitre} className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.1em]" htmlFor="devisIntro">Texte d&apos;introduction</label>
              <textarea id="devisIntro" name="devisIntro" rows={3} defaultValue={t.devisIntro} className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.1em]" htmlFor="devisDeplacement">Encadré tarifs de déplacement</label>
              <textarea id="devisDeplacement" name="devisDeplacement" rows={2} defaultValue={t.devisDeplacement} className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="self-start border border-[var(--noir)] bg-[var(--noir)] px-6 py-3 text-xs uppercase tracking-[0.12em] text-[var(--porcelaine)]"
        >
          Enregistrer
        </button>
      </form>

      <h2 className="mt-16 font-display text-sm uppercase tracking-[0.12em]">Galerie</h2>
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {photos.map((p) => (
          <div key={p.id} className="border border-[var(--ligne)] bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.url} alt={p.legende ?? ""} className="h-32 w-full object-cover" />
            <div className="p-2 text-xs">
              <p className="text-[var(--gris)]">{p.legende}</p>
              <form action={deletePhotoGalerie.bind(null, p.id)}>
                <button type="submit" className="mt-1 uppercase tracking-[0.1em] text-red-700">
                  Supprimer
                </button>
              </form>
            </div>
          </div>
        ))}
        {photos.length === 0 && (
          <p className="col-span-full text-sm text-[var(--gris)]">Aucune photo dans la galerie.</p>
        )}
      </div>

      <form action={addPhotoGalerie} className="mt-6 flex flex-wrap items-end gap-4">
        <div>
          <label className="text-xs uppercase tracking-[0.1em]" htmlFor="photo">Photo</label>
          <input id="photo" name="photo" type="file" required accept="image/jpeg,image/png,image/webp" className="mt-1 block text-sm" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.1em]" htmlFor="legende">Légende (optionnel)</label>
          <input id="legende" name="legende" placeholder="ex: Mariée" className="mt-1 border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
        </div>
        <button
          type="submit"
          className="border border-[var(--noir)] px-5 py-2.5 text-xs uppercase tracking-[0.1em] hover:bg-[var(--noir)] hover:text-[var(--porcelaine)]"
        >
          Ajouter à la galerie
        </button>
      </form>
    </section>
  );
}
