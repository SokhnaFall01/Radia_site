import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSiteTextes } from "@/lib/contenuTextes";
import { getCreneauxDisponibles } from "@/lib/creneaux";
import { reserver } from "@/lib/actions/reservation";

export const metadata = { title: "Réservation — Radia Glam" };

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default async function ReservationPage({
  searchParams,
}: {
  searchParams: Promise<{
    prestationId?: string;
    maquilleuseId?: string;
    date?: string;
    erreur?: string;
  }>;
}) {
  const { prestationId, maquilleuseId, date, erreur } = await searchParams;

  const [t, prestations, maquilleuses] = await Promise.all([
    getSiteTextes(),
    prisma.prestation.findMany({ where: { actif: true }, orderBy: { nom: "asc" } }),
    prisma.user.findMany({ where: { role: "STAFF" }, select: { id: true, nom: true } }),
  ]);

  const selectedPrestation = prestationId
    ? prestations.find((p) => p.id === prestationId)
    : undefined;

  const creneauxResult =
    prestationId && date
      ? await getCreneauxDisponibles(date, prestationId, maquilleuseId || undefined)
      : null;

  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="font-display text-2xl uppercase tracking-[0.12em]">{t.reservationTitre}</h1>
      <p className="mt-4 text-[var(--gris)]">{t.reservationIntro}</p>
      <p className="mt-3 text-sm text-[var(--gris)]">
        Pour un mariage, un Henné Time ou un événement particulier,{" "}
        <Link href="/devis" className="border-b border-[var(--brass)]">
          demandez plutôt un devis sur mesure
        </Link>
        .
      </p>

      {prestations.length === 0 ? (
        <p className="mt-10 text-sm text-[var(--gris)]">
          Aucune prestation disponible pour le moment. Ajoutez-en depuis le tableau de bord admin.
        </p>
      ) : (
        <>
          <form method="GET" className="mt-10 flex flex-wrap items-end gap-4">
            <div>
              <label className="text-xs uppercase tracking-[0.1em]" htmlFor="prestationId">
                Prestation
              </label>
              <select
                id="prestationId"
                name="prestationId"
                defaultValue={prestationId ?? ""}
                required
                className="mt-1 border border-[var(--noir)] bg-white px-3 py-2 text-sm"
              >
                <option value="" disabled>
                  Choisir...
                </option>
                {prestations.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nom} — {p.prixFcfa.toLocaleString("fr-FR")} FCFA ({p.dureeMinutes} min)
                  </option>
                ))}
              </select>
            </div>

            {maquilleuses.length > 0 && (
              <div>
                <label className="text-xs uppercase tracking-[0.1em]" htmlFor="maquilleuseId">
                  Maquilleuse
                </label>
                <select
                  id="maquilleuseId"
                  name="maquilleuseId"
                  defaultValue={maquilleuseId ?? ""}
                  className="mt-1 border border-[var(--noir)] bg-white px-3 py-2 text-sm"
                >
                  <option value="">Sans préférence</option>
                  {maquilleuses.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nom}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="text-xs uppercase tracking-[0.1em]" htmlFor="date">
                Date
              </label>
              <input
                id="date"
                name="date"
                type="date"
                min={todayIso()}
                defaultValue={date}
                required
                className="mt-1 border border-[var(--noir)] bg-white px-3 py-2 text-sm"
              />
            </div>

            <button
              type="submit"
              className="border border-[var(--noir)] bg-[var(--noir)] px-6 py-3 text-xs uppercase tracking-[0.12em] text-[var(--porcelaine)]"
            >
              Voir les créneaux
            </button>
          </form>

          {erreur === "indisponible" && (
            <p className="mt-6 border border-red-700 bg-red-50 px-4 py-3 text-sm text-red-700">
              Ce créneau vient d&apos;être pris. Merci d&apos;en choisir un autre.
            </p>
          )}

          {creneauxResult && selectedPrestation && date && (
            <div className="mt-10">
              <h2 className="font-display text-sm uppercase tracking-[0.12em]">
                Créneaux disponibles —{" "}
                {new Date(`${date}T00:00:00.000Z`).toLocaleDateString("fr-FR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  timeZone: "UTC",
                })}
              </h2>

              {!creneauxResult.ouvert ? (
                <p className="mt-4 text-sm text-[var(--gris)]">{creneauxResult.motif}</p>
              ) : creneauxResult.creneaux.length === 0 ? (
                <p className="mt-4 text-sm text-[var(--gris)]">
                  Plus aucun créneau disponible ce jour-là. Essayez une autre date.
                </p>
              ) : (
                <div className="mt-4 flex flex-wrap gap-3">
                  {creneauxResult.creneaux.map((heure) => (
                    <form
                      key={heure}
                      action={reserver.bind(null, selectedPrestation.id, maquilleuseId || null, date, heure)}
                    >
                      <button
                        type="submit"
                        className="border border-[var(--noir)] px-5 py-2.5 text-sm hover:bg-[var(--noir)] hover:text-[var(--porcelaine)]"
                      >
                        {heure}
                      </button>
                    </form>
                  ))}
                </div>
              )}

              {selectedPrestation.acompteRequis && (
                <p className="mt-6 text-xs text-[var(--gris)]">
                  Cette prestation demande un acompte de{" "}
                  {selectedPrestation.acompteRequis.toLocaleString("fr-FR")} FCFA, non remboursable
                  en cas d&apos;annulation.
                </p>
              )}
              <p className="mt-6 text-xs text-[var(--gris)]">
                Le paiement en ligne (Wave / Orange Money) sera activé dès la connexion du compte
                marchand PayDunya/PayTech. Pour l&apos;instant, votre demande est enregistrée et
                confirmée par le salon.
              </p>
            </div>
          )}
        </>
      )}
    </section>
  );
}
