import "server-only";
import { prisma } from "@/lib/db";

export const SITE_TEXT_KEYS = {
  heroKicker: "site_hero_kicker",
  heroTitre: "site_hero_titre",
  heroSousTitre: "site_hero_soustitre",
  heroTexte: "site_hero_texte",
  heroPhoto: "site_hero_photo",

  aproposKicker: "apropos_kicker",
  aproposTitre: "apropos_titre",
  aproposRole: "apropos_role",
  aproposBio1: "apropos_bio1",
  aproposBio2: "apropos_bio2",
  aproposBio3: "apropos_bio3",
  aproposCitation: "apropos_citation",
  aproposSignature: "apropos_signature",
  aproposPhoto: "apropos_photo",

  academyTitre: "academy_titre",
  academyIntro: "academy_intro",

  boutiqueTitre: "boutique_titre",
  boutiqueIntro: "boutique_intro",

  reservationTitre: "reservation_titre",
  reservationIntro: "reservation_intro",

  galerieTitre: "galerie_titre",
  galerieIntro: "galerie_intro",

  devisTitre: "devis_titre",
  devisIntro: "devis_intro",
  devisDeplacement: "devis_deplacement",
} as const;

export type SiteTextes = Record<keyof typeof SITE_TEXT_KEYS, string>;

const DEFAULTS: SiteTextes = {
  heroKicker: "Salon · Academy · Boutique",
  heroTitre: "Révélez votre éclat",
  heroSousTitre: "L'art de la beauté, signé Radia Glam",
  heroTexte:
    "Un espace dédié à la beauté haut de gamme : prestations sur mesure en salon, formations professionnelles certifiantes et une boutique pensée pour sublimer chaque geste.",
  heroPhoto: "",

  aproposKicker: "À propos",
  aproposTitre: "La femme derrière Radia Glam",
  aproposRole: "Fondatrice · Maquilleuse professionnelle & formatrice",
  aproposBio1:
    "Passionnée par l'art de la beauté depuis toujours, la fondatrice a créé Radia Glam avec une conviction : chaque femme mérite de révéler son éclat, quelle que soit sa carnation, son style ou son histoire.",
  aproposBio2:
    "Après des années d'expérience auprès de mariées, de shootings et de scènes, elle a voulu aller plus loin : transmettre. La Radia Glam Academy est née de ce désir de former une nouvelle génération de maquilleuses exigeantes, techniques et créatives.",
  aproposBio3:
    "Aujourd'hui, Radia Glam c'est un salon, une academy et une boutique — un univers complet pensé pour sublimer et élever.",
  aproposCitation: "Chaque visage raconte une histoire. Mon métier, c'est de la révéler.",
  aproposSignature: "— Radia",
  aproposPhoto: "",

  academyTitre: "Radia Glam Academy",
  academyIntro: "Intensive, Intermédiaire, Débutant, Automaquillage, Masterclass.",

  boutiqueTitre: "Boutique",
  boutiqueIntro: "Maquillage, pinceaux et accessoires Radia Glam.",

  reservationTitre: "Réserver une prestation",
  reservationIntro:
    "Choisissez une prestation, une maquilleuse (optionnel) et une date pour voir les créneaux disponibles.",

  galerieTitre: "Galerie",
  galerieIntro: "Réalisations du salon et travaux des élèves.",

  devisTitre: "Demander un devis",
  devisIntro:
    "Mariage, Henné Time, maquillage simple ou un tout autre projet : décrivez votre événement et nous revenons vers vous avec une proposition sur mesure.",
  devisDeplacement:
    "Déplacement sur devis : à partir de 100 000 FCFA en semaine et 350 000 FCFA le week-end.",
};

export async function getSiteTextes(): Promise<SiteTextes> {
  const rows = await prisma.contenuSite.findMany({
    where: { cle: { in: Object.values(SITE_TEXT_KEYS) } },
  });
  const byKey = new Map(rows.map((r) => [r.cle, r.valeur]));

  const result = {} as SiteTextes;
  for (const [name, cle] of Object.entries(SITE_TEXT_KEYS) as [keyof typeof SITE_TEXT_KEYS, string][]) {
    const value = byKey.get(cle);
    result[name] = value && value.trim() ? value : DEFAULTS[name];
  }
  return result;
}
