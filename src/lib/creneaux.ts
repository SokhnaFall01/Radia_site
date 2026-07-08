import "server-only";
import { prisma } from "@/lib/db";

export type CreneauxResult = {
  ouvert: boolean;
  motif: string | null;
  creneaux: string[];
};

function minutesToHHMM(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export async function getCreneauxDisponibles(
  dateStr: string,
  prestationId: string,
  maquilleuseId?: string,
): Promise<CreneauxResult> {
  const prestation = await prisma.prestation.findUnique({ where: { id: prestationId } });
  if (!prestation) {
    return { ouvert: false, motif: "Prestation introuvable.", creneaux: [] };
  }

  const date = new Date(`${dateStr}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    return { ouvert: false, motif: "Date invalide.", creneaux: [] };
  }

  const horaire = await prisma.horaireOuverture.findUnique({ where: { jour: date.getUTCDay() } });
  if (!horaire || !horaire.ouvert) {
    return { ouvert: false, motif: "Le salon est fermé ce jour-là.", creneaux: [] };
  }

  const ferme = await prisma.jourFerme.findUnique({ where: { date } });
  if (ferme) {
    return { ouvert: false, motif: ferme.motif || "Jour fermé exceptionnellement.", creneaux: [] };
  }

  const staffCount = maquilleuseId
    ? 1
    : Math.max(1, await prisma.user.count({ where: { role: "STAFF" } }));

  const step = prestation.dureeMinutes;
  const [debutH, debutM] = horaire.heureDebut.split(":").map(Number);
  const [finH, finM] = horaire.heureFin.split(":").map(Number);
  const debutMinutes = debutH * 60 + debutM;
  const finMinutes = finH * 60 + finM;

  const candidats: number[] = [];
  for (let m = debutMinutes; m + step <= finMinutes; m += step) {
    candidats.push(m);
  }

  const dayEnd = new Date(date.getTime() + 24 * 60 * 60 * 1000 - 1);

  const existants = await prisma.rendezVous.findMany({
    where: {
      date: { gte: date, lte: dayEnd },
      statut: { not: "ANNULE" },
      ...(maquilleuseId ? { maquilleuseId } : {}),
    },
    select: { date: true, prestation: { select: { dureeMinutes: true } } },
  });

  const now = new Date();
  const isToday = now.toISOString().slice(0, 10) === dateStr;
  const nowMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();

  const disponibles = candidats.filter((debut) => {
    if (isToday && debut <= nowMinutes) return false;
    const fin = debut + step;
    const chevauchements = existants.filter((rdv) => {
      const rdvDebut = rdv.date.getUTCHours() * 60 + rdv.date.getUTCMinutes();
      const rdvFin = rdvDebut + rdv.prestation.dureeMinutes;
      return rdvDebut < fin && rdvFin > debut;
    }).length;
    return chevauchements < staffCount;
  });

  return { ouvert: true, motif: null, creneaux: disponibles.map(minutesToHHMM) };
}
