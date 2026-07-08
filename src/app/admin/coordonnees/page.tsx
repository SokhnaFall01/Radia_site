import Link from "next/link";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { getCoordonnees } from "@/lib/contenu";
import { updateCoordonnees } from "@/lib/actions/admin";

export const metadata = { title: "Coordonnées — Administration" };

export default async function AdminCoordonneesPage({
  searchParams,
}: {
  searchParams: Promise<{ maj?: string }>;
}) {
  const session = await verifySession();
  if (!session) redirect("/connexion");
  if (session.role !== "ADMIN") redirect("/admin");
  const { maj } = await searchParams;

  const c = await getCoordonnees();

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
          Coordonnées mises à jour.
        </p>
      )}

      <form action={updateCoordonnees} className="mt-8 flex flex-col gap-4">
        <div>
          <label className="text-xs uppercase tracking-[0.1em]" htmlFor="telephone">Téléphone</label>
          <input id="telephone" name="telephone" defaultValue={c.telephone} placeholder="+221 77 000 00 00" className="mt-1 w-full border border-[var(--noir)] bg-white px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.1em]" htmlFor="whatsapp">WhatsApp (numéro international sans +)</label>
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
