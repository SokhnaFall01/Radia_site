"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { verifySession } from "@/lib/dal";

export type DevisFormState = { message?: string } | undefined;

const TYPES_VALIDES = ["MARIAGE", "HENNE", "MAQUILLAGE_SIMPLE", "AUTRE"];

export async function submitDevis(
  _state: DevisFormState,
  formData: FormData,
): Promise<DevisFormState> {
  const nom = String(formData.get("nom") ?? "").trim();
  const telephone = String(formData.get("telephone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const typeEvenement = String(formData.get("typeEvenement") ?? "");
  const precision = String(formData.get("precision") ?? "").trim();
  const dateStr = String(formData.get("date") ?? "").trim();
  const ville = String(formData.get("ville") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!nom || !telephone || !ville) {
    return { message: "Merci de renseigner au minimum votre nom, téléphone et la ville." };
  }
  if (!TYPES_VALIDES.includes(typeEvenement)) {
    return { message: "Merci de choisir un type d'événement." };
  }
  const date = new Date(dateStr);
  if (!dateStr || Number.isNaN(date.getTime())) {
    return { message: "Merci de choisir une date." };
  }

  const session = await verifySession();

  await prisma.demandeDevis.create({
    data: {
      nom,
      telephone,
      email: email || null,
      typeEvenement: typeEvenement as "MARIAGE" | "HENNE" | "MAQUILLAGE_SIMPLE" | "AUTRE",
      precision: precision || null,
      date,
      ville,
      message: message || null,
      userId: session?.userId ?? null,
    },
  });

  redirect("/devis?envoye=1");
}
