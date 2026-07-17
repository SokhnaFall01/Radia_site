"use client";

// Lecteur VdoCipher : la vidéo est chiffrée par DRM (Widevine/FairPlay) et le
// lecteur incruste lui-même un filigrane mobile au nom de l'élève (configuré
// côté serveur au moment de générer le ticket de lecture). Sur la plupart des
// téléphones, les captures et enregistrements d'écran ressortent noirs.
export default function LecteurDrm({ embedUrl }: { embedUrl: string }) {
  return (
    <div
      className="relative mt-6 select-none border border-[var(--ligne)] bg-black"
      onContextMenu={(e) => e.preventDefault()}
    >
      <iframe
        src={embedUrl}
        className="aspect-video w-full"
        allow="encrypted-media"
        allowFullScreen
        title="Vidéo du cours (protégée)"
      />
    </div>
  );
}
