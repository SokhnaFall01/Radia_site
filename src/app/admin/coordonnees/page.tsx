import Link from "next/link";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { getCoordonnees, getInfosPaiement, getInfosPass } from "@/lib/contenu";
import { updateCoordonnees } from "@/lib/actions/admin";

export const metadata = { title: "Coordonnees — Administration" };

export default async function AdminCoordonneesPage({
  searchParams,
}: {
  searchParams: Promise<{ maj?: string }>;
}) {
  const session = await verifySession();
  if (!session) redirect("/connexion");
  if (session.role !== "ADMIN") redirect("/admin");
  const { maj } = await searchParams;

  const [c, p, pass] = await Promise.all([getCoordonnees(), getInfosPaiement(), getInfosPass()]);

  return (
    <section className="mx-auto max-w-2xl px-6 py-20">
      <p className="text-xs uppercase tracking-[0.1em] text-[var(--brass)]">
        <Link href="/admin">&larr; Tableau de bord</Link>
      </p>
      <h1 className="font-display mt-3 text-2xl uppercase tracking-[0.12em]">
        Coordonnees &amp; reseaux
      </h1>

      {maj === "ok" && (
        <p className="mt-4 border border-[var(--brass)] bg-[var(--blush)] px-4 py-3 text-sm">
          Coordonnees mises a jour.
        </p>
      )}

      <form action={updateCoordonnees} className="mt-8 flex flex-col gap-4">
        <div>
          <label className="text-xs uppercase tracking-[0.1em]" htmlFor="telephone">Telephone</label>
          <input id="telephone" name="telephone" defaultValue={c.telephone} placeholder="+221 77 000 00 00" className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.1em]" htmlFor="whatsapp">WhatsApp (numero international sans +)</label>
          <input id="whatsapp" name="whatsapp" defaultValue={c.whatsapp} placeholder="221770000000" className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.1em]" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" defaultValue={c.email} placeholder="contact@radiaglam.com" className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.1em]" htmlFor="adresse">Adresse</label>
          <input id="adresse" name="adresse" defaultValue={c.adresse} placeholder="Dakar, Senegal" className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.1em]" htmlFor="mapsUrl">Lien Google Maps</label>
          <input id="mapsUrl" name="mapsUrl" defaultValue={c.mapsUrl} placeholder="https://maps.google.com/..." className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.1em]" htmlFor="instagram">Instagram (lien complet)</label>
          <input id="instagram" name="instagram" defaultValue={c.instagram} placeholder="https://instagram.com/radiaglam" className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.1em]" htmlFor="tiktok">TikTok (lien complet)</label>
          <input id="tiktok" name="tiktok" defaultValue={c.tiktok} placeholder="https://tiktok.com/@radiaglam" className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.1em]" htmlFor="facebook">Facebook (lien complet)</label>
          <input id="facebook" name="facebook" defaultValue={c.facebook} placeholder="https://facebook.com/radiaglam" className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
        </div>
        <h2 className="mt-6 font-display text-sm uppercase tracking-[0.12em]">
          Paiement des formations en ligne
        </h2>
        <p className="text-xs text-[var(--gris)]">
          Ces numeros s&apos;affichent lors de l&apos;achat d&apos;une formation. La cliente paie,
          puis vous confirmez le paiement depuis « Inscriptions formations ».
        </p>
        <div>
          <label className="text-xs uppercase tracking-[0.1em]" htmlFor="wave">Numero Wave</label>
          <input id="wave" name="wave" defaultValue={p.wave} placeholder="+221 77 000 00 00" className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.1em]" htmlFor="orangeMoney">Numero Orange Money</label>
          <input id="orangeMoney" name="orangeMoney" defaultValue={p.orangeMoney} placeholder="+221 77 000 00 00" className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.1em]" htmlFor="freeMoney">Numero Free Money</label>
          <input id="freeMoney" name="freeMoney" defaultValue={p.freeMoney} placeholder="+221 76 000 00 00" className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.1em]" htmlFor="instructions">Instructions de paiement (optionnel)</label>
          <textarea id="instructions" name="instructions" defaultValue={p.instructions} rows={2} placeholder="ex: Merci d'indiquer votre nom en note du paiement." className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
        </div>

        <h2 className="mt-6 font-display text-sm uppercase tracking-[0.12em]">
          Pass Academy (All Access)
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs uppercase tracking-[0.1em]" htmlFor="prix">Prix du Pass (FCFA)</label>
            <input id="prix" name="prix" type="number" min={0} defaultValue={pass.prix || ""} placeholder="299000" className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.1em]" htmlFor="dureeMois">Duree d&apos;acces (mois)</label>
            <input id="dureeMois" name="dureeMois" type="number" min={1} defaultValue={pass.dureeMois} placeholder="12" className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
          </div>
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.1em]" htmlFor="description">Description du Pass (optionnel)</label>
          <textarea id="description" name="description" defaultValue={pass.description} rows={2} placeholder="Acces a toutes les formations en ligne pendant 12 mois." className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
        </div>

        <button
          type="submit"
          className="mt-2 self-start border border-[var(--noir)] bg-[var(--noir)] px-6 py-3 text-xs uppercase tracking-[0.12em] text-[var(--porcelaine)]"
        >
          Enregistrer
        </button>
      </form>
    </section>
  );
}
