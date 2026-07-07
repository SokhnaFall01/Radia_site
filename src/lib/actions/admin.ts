"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { verifySession } from "@/lib/dal";
import { saveUploadedPhoto } from "@/lib/uploads";
import { CONTACT_KEYS } from "@/lib/contenu";
import { SITE_TEXT_KEYS } from "@/lib/contenuTextes";

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

function photoFile(formData: FormData) {
  const v = formData.get("photo");
  return v instanceof File ? v : null;
}

// ---- Formations ----

export async function createFormation(formData: FormData) {
  await requireAdmin();

  let photoUrl: string | null = null;
  try {
    photoUrl = await saveUploadedPhoto(photoFile(formData));
  } catch {
    redirect("/admin/formations?erreur=photo");
  }

  await prisma.formation.create({
    data: {
      titre: str(formData, "titre"),
      description: str(formData, "description"),
      programme: str(formData, "programme"),
      duree: str(formData, "duree"),
      tarifFcfa: num(formData, "tarifFcfa"),
      niveau: str(formData, "niveau"),
      publie: formData.get("publie") === "on",
      photos: photoUrl ? [photoUrl] : [],
    },
  });

  revalidatePath("/admin/formations");
  revalidatePath("/academy");
  redirect("/admin/formations");
}

export async function updateFormation(id: string, formData: FormData) {
  await requireAdmin();

  let photoUrl: string | null = null;
  try {
    photoUrl = await saveUploadedPhoto(photoFile(formData));
  } catch {
    redirect(`/admin/formations/${id}?erreur=photo`);
  }

  const existing = await prisma.formation.findUnique({ where: { id }, select: { photos: true } });

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
      photos: photoUrl ? [photoUrl] : (existing?.photos ?? []),
    },
  });

  revalidatePath("/admin/formations");
  revalidatePath(`/admin/formations/${id}`);
  revalidatePath("/academy");
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
  revalidatePath("/academy");
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

  let photoUrl: string | null = null;
  try {
    photoUrl = await saveUploadedPhoto(photoFile(formData));
  } catch {
    redirect("/admin/prestations?erreur=photo");
  }

  const acompte = str(formData, "acompteRequis");

  await prisma.prestation.create({
    data: {
      nom: str(formData, "nom"),
      dureeMinutes: num(formData, "dureeMinutes"),
      prixFcfa: num(formData, "prixFcfa"),
      acompteRequis: acompte ? Number(acompte) : null,
      actif: formData.get("actif") === "on",
      photo: photoUrl,
    },
  });

  revalidatePath("/admin/prestations");
  revalidatePath("/reservation");
  redirect("/admin/prestations");
}

export async function updatePrestation(id: string, formData: FormData) {
  await requireAdmin();

  let photoUrl: string | null = null;
  try {
    photoUrl = await saveUploadedPhoto(photoFile(formData));
  } catch {
    redirect("/admin/prestations?erreur=photo");
  }

  const existing = await prisma.prestation.findUnique({ where: { id }, select: { photo: true } });
  const acompte = str(formData, "acompteRequis");

  await prisma.prestation.update({
    where: { id },
    data: {
      nom: str(formData, "nom"),
      dureeMinutes: num(formData, "dureeMinutes"),
      prixFcfa: num(formData, "prixFcfa"),
      acompteRequis: acompte ? Number(acompte) : null,
      actif: formData.get("actif") === "on",
      photo: photoUrl ?? existing?.photo ?? null,
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

  let photoUrl: string | null = null;
  try {
    photoUrl = await saveUploadedPhoto(photoFile(formData));
  } catch {
    redirect("/admin/produits?erreur=photo");
  }

  await prisma.produit.create({
    data: {
      nom: str(formData, "nom"),
      prixFcfa: num(formData, "prixFcfa"),
      categorie: str(formData, "categorie"),
      stock: num(formData, "stock"),
      seuilAlerte: num(formData, "seuilAlerte") || 5,
      photos: photoUrl ? [photoUrl] : [],
    },
  });

  revalidatePath("/admin/produits");
  revalidatePath("/boutique");
  redirect("/admin/produits");
}

export async function updateProduit(id: string, formData: FormData) {
  await requireAdmin();

  let photoUrl: string | null = null;
  try {
    photoUrl = await saveUploadedPhoto(photoFile(formData));
  } catch {
    redirect("/admin/produits?erreur=photo");
  }

  const existing = await prisma.produit.findUnique({ where: { id }, select: { photos: true } });

  await prisma.produit.update({
    where: { id },
    data: {
      nom: str(formData, "nom"),
      prixFcfa: num(formData, "prixFcfa"),
      categorie: str(formData, "categorie"),
      stock: num(formData, "stock"),
      seuilAlerte: num(formData, "seuilAlerte") || 5,
      photos: photoUrl ? [photoUrl] : (existing?.photos ?? []),
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

// ---- Horaires d'ouverture ----

export async function updateHoraires(formData: FormData) {
  await requireAdmin();

  for (let jour = 0; jour < 7; jour++) {
    const ouvert = formData.get(`ouvert-${jour}`) === "on";
    const heureDebut = str(formData, `debut-${jour}`) || "09:00";
    const heureFin = str(formData, `fin-${jour}`) || "18:00";

    await prisma.horaireOuverture.upsert({
      where: { jour },
      update: { ouvert, heureDebut, heureFin },
      create: { jour, ouvert, heureDebut, heureFin },
    });
  }

  revalidatePath("/admin/horaires");
  revalidatePath("/reservation");
  redirect("/admin/horaires?maj=ok");
}

export async function createJourFerme(formData: FormData) {
  await requireAdmin();

  const dateStr = str(formData, "date");
  if (!dateStr) redirect("/admin/horaires");

  try {
    await prisma.jourFerme.create({
      data: { date: new Date(`${dateStr}T00:00:00.000Z`), motif: str(formData, "motif") || null },
    });
  } catch {
    redirect("/admin/horaires?erreur=doublon");
  }

  revalidatePath("/admin/horaires");
  revalidatePath("/reservation");
  redirect("/admin/horaires");
}

export async function deleteJourFerme(id: string) {
  await requireAdmin();

  await prisma.jourFerme.delete({ where: { id } });

  revalidatePath("/admin/horaires");
  revalidatePath("/reservation");
  redirect("/admin/horaires");
}

// ---- Coordonnees ----

export async function updateCoordonnees(formData: FormData) {
  await requireAdmin();

  for (const [name, cle] of Object.entries(CONTACT_KEYS)) {
    const valeur = str(formData, name);
    await prisma.contenuSite.upsert({
      where: { cle },
      update: { valeur },
      create: { cle, valeur },
    });
  }

  revalidatePath("/admin/coordonnees");
  revalidatePath("/contact");
  revalidatePath("/");
  redirect("/admin/coordonnees?maj=ok");
}

// ---- Contenu du site (textes + photos) ----

function photoFileNamed(formData: FormData, name: string) {
  const v = formData.get(name);
  return v instanceof File ? v : null;
}

export async function updateSiteTextes(formData: FormData) {
  await requireAdmin();

  let heroPhotoUrl: string | null = null;
  let aproposPhotoUrl: string | null = null;
  try {
    heroPhotoUrl = await saveUploadedPhoto(photoFileNamed(formData, "heroPhoto"));
    aproposPhotoUrl = await saveUploadedPhoto(photoFileNamed(formData, "aproposPhoto"));
  } catch {
    redirect("/admin/contenu?erreur=photo");
  }

  for (const [name, cle] of Object.entries(SITE_TEXT_KEYS)) {
    if (name === "heroPhoto" || name === "aproposPhoto") continue;
    const valeur = str(formData, name);
    await prisma.contenuSite.upsert({
      where: { cle },
      update: { valeur },
      create: { cle, valeur },
    });
  }

  if (heroPhotoUrl) {
    await prisma.contenuSite.upsert({
      where: { cle: SITE_TEXT_KEYS.heroPhoto },
      update: { valeur: heroPhotoUrl },
      create: { cle: SITE_TEXT_KEYS.heroPhoto, valeur: heroPhotoUrl },
    });
  }
  if (aproposPhotoUrl) {
    await prisma.contenuSite.upsert({
      where: { cle: SITE_TEXT_KEYS.aproposPhoto },
      update: { valeur: aproposPhotoUrl },
      create: { cle: SITE_TEXT_KEYS.aproposPhoto, valeur: aproposPhotoUrl },
    });
  }

  revalidatePath("/admin/contenu");
  revalidatePath("/");
  revalidatePath("/a-propos");
  redirect("/admin/contenu?maj=ok");
}

export async function addPhotoGalerie(formData: FormData) {
  await requireAdmin();

  let url: string | null = null;
  try {
    url = await saveUploadedPhoto(photoFile(formData));
  } catch {
    redirect("/admin/contenu?erreur=photo");
  }
  if (!url) redirect("/admin/contenu?erreur=photo");

  const count = await prisma.photoGalerie.count();

  await prisma.photoGalerie.create({
    data: { url, legende: str(formData, "legende") || null, ordre: count },
  });

  revalidatePath("/admin/contenu");
  revalidatePath("/galerie");
  revalidatePath("/");
  redirect("/admin/contenu?maj=ok");
}

export async function deletePhotoGalerie(id: string) {
  await requireAdmin();

  await prisma.photoGalerie.delete({ where: { id } });

  revalidatePath("/admin/contenu");
  revalidatePath("/galerie");
  revalidatePath("/");
  redirect("/admin/contenu?maj=ok");
}
