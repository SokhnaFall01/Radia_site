import { prisma } from "@/lib/db";
import ReservationForm from "./reservation-form";

export const metadata = { title: "Reservation — Radia Glam" };

export default async function ReservationPage() {
  const [prestations, maquilleuses] = await Promise.all([
    prisma.prestation.findMany({ where: { actif: true }, orderBy: { nom: "asc" } }),
    prisma.user.findMany({ where: { role: "STAFF" }, select: { id: true, nom: true } }),
  ]);

  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="font-display text-2xl uppercase tracking-[0.12em]">Reserver une prestation</h1>
      <p className="mt-4 text-[var(--gris)]">
        Choisissez une prestation, une maquilleuse (optionnel) et un creneau.
      </p>

      {prestations.length === 0 ? (
        <p className="mt-10 text-sm text-[var(--gris)]">
          Aucune prestation disponible pour le moment. Ajoutez-en depuis le tableau de bord admin.
        </p>
      ) : (
        <ReservationForm prestations={prestations} maquilleuses={maquilleuses} />
      )}
    </section>
  );
}
