"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { verifySession } from "@/lib/dal";

async function requireAdmin() {
  const session = await verifySession();
  if (!session) redirect("/connexion");
  if (session.role !== "ADMIN") redirect("/admin");
  return session;
}

function str(formData: FormData, key: string) {
  const v = formData.get(key);
  return typeof v === "string" ? v.trim() : "";
}

function num(formData: FormData, key: string) {
  const v = Number(formData.get(key));
  return Number.isFinite(v) ? v : 0;
}

// ---- Formations ----

export async function createFormation(formData: FormData) {
  await requireAdmin();

  await prisma.formation.create({
    data: {
      titre: str(formData, "titre"),
      description: str(formData, "description"),
      programme: str(formData, "programme"),
      duree: str(formData, "duree"),
      tarifFcfa: num(formData, "tarifFcfa"),
      niveau: str(formData, "niveau"),
      publie: formData.get("publie") === "on",
    },
  });

  revalidatePath("/admin/formations");
  redirect("/admin/formations");
}

export async function updateFormation(id: string, formData: FormData) {
  await requireAdmin();

  await prisma.formation.update({
    where: { id },
    data: {
      titre: str(formData, "titre"),
      description: str(formData, "description"),
      programme: str(formData, "programme"),
      duree: str(formData, "duree"),
      tarifFcfa: num(formData, "tarifFcfa"),
      niveau: str(formData, "niveau"),
      publie: formData.get("publie") === "on",
    },
  });

  revalidatePath("/admin/formations");
  revalidatePath(`/admin/formations/${id}`);
  redirect(`/admin/formations/${id}?maj=ok`);
}

export async function deleteFormation(id: string) {
  await requireAdmin();

  try {
    await prisma.formation.delete({ where: { id } });
  } catch {
    redirect("/admin/formations?erreur=suppression");
  }

  revalidatePath("/admin/formations");
  redirect("/admin/formations");
}

export async function createFormationSession(formationId: string, formData: FormData) {
  await requireAdmin();

  const placesMax = num(formData, "placesMax");
  await prisma.sessionformation.create({
    data: {
      formationId,
      dateDebut: new Date(str(formData, "dateDebut")),
      dateFin: new Date(str(formData, "dateFin")),
      placesMax,
      placesRestantes: placesMax,
    },
  });

  revalidatePath(`/admin/formations/${formationId}`);
  redirect(`/admin/formations/${formationId}`);
}

export async function deleteFormationSession(formationId: string, id: string) {
  await requireAdmin();

  try {
    await prisma.sessionformation.delete({ where: { id } });
  } catch {
    redirect(`/admin/formations/${formationId}?erreur=suppression`);
  }

  revalidatePath(`/admin/formations/${formationId}`);
  redirect(`/admin/formations/${formationId}`);
}

// ---- Prestations ----

export async function createPrestation(formData: FormData) {
  await requireAdmin();

  const acompte = str(formData, "acompteRequis");

  await prisma.prestation.create({
    data: {
      nom: str(formData, "nom"),
      dureeMinutes: num(formData, "dureeMinutes"),
      prixFcfa: num(formData, "prixFcfa"),
      acompteRequis: acompte ? Number(acompte) : null,
      actif: formData.get("actif") === "on",
    },
  });

  revalidatePath("/admin/prestations");
  revalidatePath("/reservation");
  redirect("/admin/prestations");
}

export async function updatePrestation(id: string, formData: FormData) {
  await requireAdmin();

  const acompte = str(formData, "acompteRequis");

  await prisma.prestation.update({
    where: { id },
    data: {
      nom: str(formData, "nom"),
      dureeMinutes: num(formData, "dureeMinutes"),
      prixFcfa: num(formData, "prixFcfa"),
      acompteRequis: acompte ? Number(acompte) : null,
      actif: formData.get("actif") === "on",
    },
  });

  revalidatePath("/admin/prestations");
  revalidatePath("/reservation");
  redirect("/admin/prestations?maj=ok");
}

export async function deletePrestation(id: string) {
  await requireAdmin();

  try {
    await prisma.prestation.delete({ where: { id } });
  } catch {
    redirect("/admin/prestations?erreur=suppression");
  }

  revalidatePath("/admin/prestations");
  revalidatePath("/reservation");
  redirect("/admin/prestations");
}

// ---- Produits ----

export async function createProduit(formData: FormData) {
  await requireAdmin();

  await prisma.produit.create({
    data: {
      nom: str(formData, "nom"),
      prixFcfa: num(formData, "prixFcfa"),
      categorie: str(formData, "categorie"),
      stock: num(formData, "stock"),
      seuilAlerte: num(formData, "seuilAlerte") || 5,
    },
  });

  revalidatePath("/admin/produits");
  revalidatePath("/boutique");
  redirect("/admin/produits");
}

export async function updateProduit(id: string, formData: FormData) {
  await requireAdmin();

  await prisma.produit.update({
    where: { id },
    data: {
      nom: str(formData, "nom"),
      prixFcfa: num(formData, "prixFcfa"),
      categorie: str(formData, "categorie"),
      stock: num(formData, "stock"),
      seuilAlerte: num(formData, "seuilAlerte") || 5,
    },
  });

  revalidatePath("/admin/produits");
  revalidatePath("/boutique");
  redirect("/admin/produits?maj=ok");
}

export async function deleteProduit(id: string) {
  await requireAdmin();

  try {
    await prisma.produit.delete({ where: { id } });
  } catch {
    redirect("/admin/produits?erreur=suppression");
  }

  revalidatePath("/admin/produits");
  revalidatePath("/boutique");
  redirect("/admin/produits");
}
