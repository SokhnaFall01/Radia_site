"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

const TYPES_ACCEPTES = ["video/mp4", "video/webm", "video/quicktime"];

export default function UploadVideo({
  leconId,
  videoPresente,
}: {
  leconId: string;
  videoPresente: boolean;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [progression, setProgression] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function envoyer(file: File) {
    if (!TYPES_ACCEPTES.includes(file.type)) {
      setMessage("Format non supporté : utilisez un fichier .mp4, .webm ou .mov.");
      return;
    }
    setMessage(null);
    setProgression(0);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `/api/admin/lecons/${leconId}/video`);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) setProgression(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      setProgression(null);
      if (xhr.status === 200) {
        setMessage("Vidéo envoyée. Elle est en ligne pour les élèves inscrites.");
        if (inputRef.current) inputRef.current.value = "";
        router.refresh();
      } else {
        try {
          setMessage(JSON.parse(xhr.responseText).erreur ?? "Échec de l'envoi.");
        } catch {
          setMessage("Échec de l'envoi. Réessayez.");
        }
      }
    };
    xhr.onerror = () => {
      setProgression(null);
      setMessage("Échec de l'envoi (connexion interrompue). Réessayez.");
    };
    xhr.send(file);
  }

  async function supprimer() {
    if (!window.confirm("Supprimer la vidéo hébergée de cette leçon ?")) return;
    const resp = await fetch(`/api/admin/lecons/${leconId}/video`, { method: "DELETE" });
    setMessage(resp.ok ? "Vidéo supprimée." : "Échec de la suppression.");
    router.refresh();
  }

  return (
    <div className="border border-[var(--ligne)] bg-white p-5">
      <p className="text-xs uppercase tracking-[0.1em]">
        Vidéo hébergée sur le serveur {videoPresente ? "— une vidéo est en ligne" : ""}
      </p>
      <p className="mt-1 text-xs text-[var(--gris)]">
        mp4, webm ou mov, 2 Go max. Réservée aux élèves inscrites, lue en streaming avec filigrane.
        {videoPresente ? " Envoyer un nouveau fichier remplace l'actuel." : ""}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          disabled={progression !== null}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) envoyer(f);
          }}
          className="text-sm"
        />
        {videoPresente && progression === null && (
          <button
            type="button"
            onClick={supprimer}
            className="border border-red-700 px-3 py-1.5 text-xs uppercase tracking-[0.1em] text-red-700"
          >
            Supprimer la vidéo
          </button>
        )}
      </div>

      {progression !== null && (
        <div className="mt-3">
          <div className="h-2 w-full border border-[var(--noir)] bg-white">
            <div className="h-full bg-[var(--brass)]" style={{ width: `${progression}%` }} />
          </div>
          <p className="mt-1 text-xs text-[var(--gris)]">
            Envoi en cours... {progression}% — ne fermez pas la page.
          </p>
        </div>
      )}

      {message && <p className="mt-3 text-sm">{message}</p>}
    </div>
  );
}
