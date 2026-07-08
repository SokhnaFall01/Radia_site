import { prisma } from "@/lib/db";
import { getCoordonnees } from "@/lib/contenu";
import { JOURS } from "@/lib/horaires";

export const metadata = { title: "Contact — Radia Glam" };

export default async function ContactPage() {
  const [c, horaires] = await Promise.all([
    getCoordonnees(),
    prisma.horaireOuverture.findMany({ orderBy: { jour: "asc" } }),
  ]);
  const horaireByJour = new Map(horaires.map((h) => [h.jour, h]));

  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="font-display text-2xl uppercase tracking-[0.12em]">Contact</h1>
      <p className="mt-4 text-[var(--gris)]">
        Une question, une envie particulière ? Contactez-nous directement.
      </p>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row">
        {c.whatsapp && (
          <a
            href={`https://wa.me/${c.whatsapp}`}
            className="border border-[var(--noir)] px-6 py-3 text-center text-xs uppercase tracking-[0.12em] hover:bg-[var(--noir)] hover:text-[var(--porcelaine)]"
          >
            WhatsApp
          </a>
        )}
        {c.email && (
          <a
            href={`mailto:${c.email}`}
            className="border border-[var(--noir)] px-6 py-3 text-center text-xs uppercase tracking-[0.12em] hover:bg-[var(--noir)] hover:text-[var(--porcelaine)]"
          >
            Email
          </a>
        )}
        {c.telephone && (
          <a
            href={`tel:${c.telephone}`}
            className="border border-[var(--noir)] px-6 py-3 text-center text-xs uppercase tracking-[0.12em] hover:bg-[var(--noir)] hover:text-[var(--porcelaine)]"
          >
            {c.telephone}
          </a>
        )}
      </div>

      {!c.whatsapp && !c.email && !c.telephone && (
        <p className="mt-8 text-sm text-[var(--gris)]">
          Coordonnées à venir. Ajoutez-les depuis le tableau de bord admin.
        </p>
      )}

      <div className="mt-14 grid gap-10 sm:grid-cols-2">
        <div>
          <h2 className="font-display text-sm uppercase tracking-[0.12em]">Adresse</h2>
          <p className="mt-3 text-sm text-[var(--gris)]">
            {c.adresse || "À venir"}
          </p>
          {c.mapsUrl && (
            <a
              href={c.mapsUrl}
              className="mt-3 inline-block border-b border-[var(--brass)] text-xs uppercase tracking-[0.14em]"
            >
              Itinéraire
            </a>
          )}

          <h2 className="font-display mt-8 text-sm uppercase tracking-[0.12em]">Suivez-nous</h2>
          <div className="mt-3 flex gap-4 text-xs uppercase tracking-[0.14em]">
            {c.instagram && <a href={c.instagram} className="border-b border-[var(--brass)]">Instagram</a>}
            {c.tiktok && <a href={c.tiktok} className="border-b border-[var(--brass)]">TikTok</a>}
            {c.facebook && <a href={c.facebook} className="border-b border-[var(--brass)]">Facebook</a>}
            {!c.instagram && !c.tiktok && !c.facebook && (
              <span className="text-[var(--gris)] normal-case">À venir</span>
            )}
          </div>
        </div>

        <div>
          <h2 className="font-display text-sm uppercase tracking-[0.12em]">Horaires</h2>
          <ul className="mt-3 flex flex-col gap-1 text-sm text-[var(--gris)]">
            {JOURS.map((label, jour) => {
              const h = horaireByJour.get(jour);
              return (
                <li key={jour} className="flex justify-between capitalize">
                  <span>{label}</span>
                  <span>{h && h.ouvert ? `${h.heureDebut} — ${h.heureFin}` : "Fermé"}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
