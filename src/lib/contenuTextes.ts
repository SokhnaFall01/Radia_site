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
} as const;

export type SiteTextes = Record<keyof typeof SITE_TEXT_KEYS, string>;

const DEFAULTS: SiteTextes = {
  heroKicker: "Salon · Academy · Boutique",
  heroTitre: "Revelez votre eclat",
  heroSousTitre: "L'art de la beaute, signe Radia Glam",
  heroTexte:
    "Un espace dedie a la beaute haut de gamme : prestations sur mesure en salon, formations professionnelles certifiantes et une boutique pensee pour sublimer chaque geste.",
  heroPhoto: "",

  aproposKicker: "A propos",
  aproposTitre: "La femme derriere Radia Glam",
  aproposRole: "Fondatrice · Maquilleuse professionnelle & formatrice",
  aproposBio1:
    "Passionnee par l'art de la beaute depuis toujours, la fondatrice a cree Radia Glam avec une conviction : chaque femme merite de reveler son eclat, quelle que soit sa carnation, son style ou son histoire.",
  aproposBio2:
    "Apres des annees d'experience aupres de mariees, de shootings et de scenes, elle a voulu aller plus loin : transmettre. La Radia Glam Academy est nee de ce desir de former une nouvelle generation de maquilleuses exigeantes, techniques et creatives.",
  aproposBio3:
    "Aujourd'hui, Radia Glam c'est un salon, une academy et une boutique — un univers complet pense pour sublimer et elever.",
  aproposCitation: "Chaque visage raconte une histoire. Mon metier, c'est de la reveler.",
  aproposSignature: "— Radia",
  aproposPhoto: "",
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
