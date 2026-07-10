"use client";

// Lecteur vidéo « protégé » : pas de bouton télécharger, pas de
// picture-in-picture, clic droit bloqué, et un filigrane au nom de
// l'élève par-dessus la vidéo. Une capture d'écran ou un enregistrement
// d'écran ne peuvent pas être bloqués par un site web — le filigrane
// rend toute copie traçable, c'est la dissuasion la plus efficace.

function embedUrl(videoUrl: string): string | null {
  try {
    const url = new URL(videoUrl);
    const host = url.hostname.replace(/^www\./, "");
    if (host === "youtube.com" || host === "m.youtube.com") {
      const id = url.searchParams.get("v");
      return id ? `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1` : null;
    }
    if (host === "youtu.be") {
      const id = url.pathname.slice(1).split("/")[0];
      return id ? `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1` : null;
    }
    if (host === "vimeo.com") {
      const id = url.pathname.slice(1).split("/")[0];
      return id && /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}` : null;
    }
    return null;
  } catch {
    return null;
  }
}

export default function LecteurVideo({
  videoUrl,
  filigrane,
}: {
  videoUrl: string;
  filigrane: string;
}) {
  const embed = embedUrl(videoUrl);

  return (
    <div
      className="relative mt-6 select-none border border-[var(--ligne)] bg-black"
      onContextMenu={(e) => e.preventDefault()}
    >
      {embed ? (
        <iframe
          src={embed}
          className="aspect-video w-full"
          allow="encrypted-media; fullscreen"
          allowFullScreen
          title="Vidéo du cours"
        />
      ) : (
        <video
          controls
          controlsList="nodownload noremoteplayback noplaybackrate"
          disablePictureInPicture
          onContextMenu={(e) => e.preventDefault()}
          className="aspect-video w-full"
          src={videoUrl}
        />
      )}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-end justify-end overflow-hidden p-3"
      >
        <span className="rotate-[-8deg] text-xs uppercase tracking-[0.2em] text-white/35">
          {filigrane}
        </span>
      </div>
    </div>
  );
}
