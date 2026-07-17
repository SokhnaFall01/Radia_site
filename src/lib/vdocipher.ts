import "server-only";

// Intégration VdoCipher : vidéos chiffrées par DRM (Widevine/FairPlay),
// captures et enregistrements d'écran bloqués sur la plupart des téléphones.
// L'intégration est dormante tant que VDOCIPHER_API_SECRET n'est pas défini.

// Surchargeable pour les tests (VDOCIPHER_API_BASE) ; en production la
// valeur par défaut est la bonne.
const API_BASE = process.env.VDOCIPHER_API_BASE ?? "https://dev.vdocipher.com/api";
const OTP_TTL_SECONDES = 300;

export function vdocipherActif(): boolean {
  return Boolean(process.env.VDOCIPHER_API_SECRET);
}

// Identifiants vidéo VdoCipher : chaîne hexadécimale (32 caractères en
// pratique) — on reste tolérant sur la longueur.
export function vdocipherIdValide(id: string): boolean {
  return /^[a-zA-Z0-9]{16,64}$/.test(id);
}

export type OtpVdocipher = { otp: string; playbackInfo: string };

/**
 * Génère un ticket de lecture à usage limité (OTP) pour une vidéo, avec un
 * filigrane dynamique au nom de l'élève incrusté par le lecteur VdoCipher.
 * Retourne null si le service est injoignable ou la clé invalide — la page
 * affiche alors un message plutôt que de planter.
 */
export async function getOtpVdocipher(
  videoId: string,
  filigrane: string,
): Promise<OtpVdocipher | null> {
  const secret = process.env.VDOCIPHER_API_SECRET;
  if (!secret || !vdocipherIdValide(videoId)) return null;

  const annotate = JSON.stringify([
    {
      type: "rtext",
      text: filigrane,
      alpha: "0.45",
      color: "0xFFFFFF",
      size: "14",
      interval: "5000",
    },
  ]);

  try {
    const resp = await fetch(`${API_BASE}/videos/${videoId}/otp`, {
      method: "POST",
      headers: {
        Authorization: `Apisecret ${secret}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ ttl: OTP_TTL_SECONDES, annotate }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    if (!resp.ok) {
      console.error(`[vdocipher] OTP refusé pour ${videoId} : HTTP ${resp.status}`);
      return null;
    }
    const data = (await resp.json()) as Partial<OtpVdocipher>;
    if (!data.otp || !data.playbackInfo) return null;
    return { otp: data.otp, playbackInfo: data.playbackInfo };
  } catch (err) {
    console.error(`[vdocipher] OTP injoignable pour ${videoId} :`, err);
    return null;
  }
}

export function vdocipherEmbedUrl({ otp, playbackInfo }: OtpVdocipher): string {
  return `https://player.vdocipher.com/v2/?otp=${encodeURIComponent(otp)}&playbackInfo=${encodeURIComponent(playbackInfo)}`;
}
