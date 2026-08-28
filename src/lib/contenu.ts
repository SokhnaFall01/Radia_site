import "server-only";
import { prisma } from "@/lib/db";

export const CONTACT_KEYS = {
  telephone: "contact_telephone",
  whatsapp: "contact_whatsapp",
  email: "contact_email",
  adresse: "contact_adresse",
  instagram: "contact_instagram",
  tiktok: "contact_tiktok",
  facebook: "contact_facebook",
  mapsUrl: "contact_maps_url",
} as const;

export type Coordonnees = Record<keyof typeof CONTACT_KEYS, string>;

// Coordonnees de paiement affichees pour l'achat des formations en ligne
// (validation manuelle : la cliente paie puis l'admin confirme).
export const PAIEMENT_KEYS = {
  wave: "paiement_wave",
  orangeMoney: "paiement_orange_money",
  freeMoney: "paiement_free_money",
  instructions: "paiement_instructions",
} as const;

export type InfosPaiement = Record<keyof typeof PAIEMENT_KEYS, string>;

export async function getInfosPaiement(): Promise<InfosPaiement> {
  const rows = await prisma.contenuSite.findMany({
    where: { cle: { in: Object.values(PAIEMENT_KEYS) } },
  });
  const byKey = new Map(rows.map((r) => [r.cle, r.valeur]));

  const result = {} as InfosPaiement;
  for (const [name, cle] of Object.entries(PAIEMENT_KEYS) as [keyof typeof PAIEMENT_KEYS, string][]) {
    result[name] = byKey.get(cle) ?? "";
  }
  return result;
}

export async function getCoordonnees(): Promise<Coordonnees> {
  const rows = await prisma.contenuSite.findMany({
    where: { cle: { in: Object.values(CONTACT_KEYS) } },
  });
  const byKey = new Map(rows.map((r) => [r.cle, r.valeur]));

  const result = {} as Coordonnees;
  for (const [name, cle] of Object.entries(CONTACT_KEYS) as [keyof typeof CONTACT_KEYS, string][]) {
    result[name] = byKey.get(cle) ?? "";
  }
  return result;
}
