"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { verifySession } from "@/lib/dal";
import { getCreneauxDisponibles } from "@/lib/creneaux";

export async function reserver(
  prestationId: string,
  maquilleuseId: string | null,
  dateStr: string,
  heure: string,
) {
  const session = await verifySession();
  if (!session) redirect("/connexion");

  const disponibilite = await getCreneauxDisponibles(dateStr, prestationId, maquilleuseId ?? undefined);
  if (!disponibilite.ouvert || !disponibilite.creneaux.includes(heure)) {
    redirect(`/reservation?prestationId=${prestationId}&date=${dateStr}&erreur=indisponible`);
  }

  const [heureH, heureM] = heure.split(":").map(Number);
  const date = new Date(`${dateStr}T00:00:00.000Z`);
  date.setUTCHours(heureH, heureM, 0, 0);

  await prisma.rendezVous.create({
    data: {
      clienteId: session.userId,
      prestationId,
      maquilleuseId: maquilleuseId || null,
      date,
      statut: "EN_ATTENTE",
      origine: "EN_LIGNE",
    },
  });

  redirect("/espace?reservation=confirmee");
}
