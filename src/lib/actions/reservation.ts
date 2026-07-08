"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
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

export async function annulerRendezVous(id: string) {
  const session = await verifySession();
  if (!session) redirect("/connexion");

  const rdv = await prisma.rendezVous.findUnique({ where: { id } });
  if (
    !rdv ||
    rdv.clienteId !== session.userId ||
    (rdv.statut !== "EN_ATTENTE" && rdv.statut !== "CONFIRME") ||
    rdv.date <= new Date()
  ) {
    redirect("/espace?reservation=erreur-annulation");
  }

  await prisma.rendezVous.update({ where: { id }, data: { statut: "ANNULE" } });

  revalidatePath("/espace");
  revalidatePath("/admin");
  redirect("/espace?reservation=annulee");
}
