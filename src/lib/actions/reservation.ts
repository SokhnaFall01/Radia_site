"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { verifySession } from "@/lib/dal";

export type ReservationFormState = { message?: string } | undefined;

export async function reserver(
  _state: ReservationFormState,
  formData: FormData,
): Promise<ReservationFormState> {
  const session = await verifySession();
  if (!session) {
    redirect("/connexion");
  }

  const prestationId = formData.get("prestationId");
  const dateStr = formData.get("date");
  const maquilleuseId = formData.get("maquilleuseId");

  if (typeof prestationId !== "string" || typeof dateStr !== "string" || !dateStr) {
    return { message: "Merci de choisir une prestation et une date." };
  }

  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime()) || date.getTime() < Date.now()) {
    return { message: "Merci de choisir une date valide dans le futur." };
  }

  await prisma.rendezVous.create({
    data: {
      clienteId: session.userId,
      prestationId,
      maquilleuseId: typeof maquilleuseId === "string" && maquilleuseId ? maquilleuseId : null,
      date,
      statut: "EN_ATTENTE",
      origine: "EN_LIGNE",
    },
  });

  redirect("/espace?reservation=confirmee");
}
