import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { getInfosPaiement, getCoordonnees, getInfosPass } from "@/lib/contenu";
import { demanderPass } from "@/lib/actions/lms";

export const metadata = { title: "Activer mon Pass — Radia Glam Academy" };

export default async function AcheterPassPage({
  searchParams,
}: {
  searchParams: Promise<{ demande?: string }>;
}) {
  const { demande } = await searchParams;
  const pass = await getInfosPass();
  const prix = pass.prix > 0 ? pass.prix.toLocaleString("fr-FR") : null;
  const session = await verifySession();

  const backLink = (
    <p className="mt-10 text-xs uppercase tracking-[0.1em] text-[var(--gris)]">
      <Link href="/academy/pass" className="underline">
        &larr; Revenir a la presentation du Pass
      </Link>
    </p>
  );

  if (!session) {
    const next = encodeURIComponent("/academy/pass/acheter");
    return (
      <section className="mx-auto max-w-md px-6 py-20">
        <p className="text-4xl">👑</p>
        <h1 className="font-display mt-3 text-2xl uppercase tracking-[0.12em]">Radiaglam Academy Pass</h1>
        {prix && <p className="mt-2 font-display text-xl">{prix} FCFA</p>}
        <p className="mt-6 text-sm text-[var(--gris)]">
          Creez votre compte (ou connectez-vous) pour activer votre Pass et acceder a toutes les
          formations en ligne.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Link
            href={`/inscription?next=${next}`}
            className="border border-[var(--noir)] bg-[var(--noir)] px-6 py-4 text-center text-xs uppercase tracking-[0.14em] text-[var(--porcelaine)]"
          >
            Creer mon compte
          </Link>
          <Link
            href={`/connexion?next=${next}`}
            className="border border-[var(--noir)] px-6 py-4 text-center text-xs uppercase tracking-[0.14em] hover:bg-[var(--noir)] hover:text-[var(--porcelaine)]"
          >
            J&apos;ai deja un compte
          </Link>
        </div>
        {backLink}
      </section>
    );
  }

  const passActif = await prisma.pass.findFirst({
    where: { eleveId: session.userId, statut: "ACTIF" },
  });

  if (passActif) {
    return (
      <section className="mx-auto max-w-md px-6 py-20 text-center">
        <p className="text-4xl">👑</p>
        <h1 className="font-display mt-4 text-2xl uppercase tracking-[0.12em]">Votre Pass est actif</h1>
        <p className="mt-4 text-sm text-[var(--gris)]">
          Vous avez acces a toutes les formations en ligne
          {passActif.dateFin ? ` jusqu'au ${passActif.dateFin.toLocaleDateString("fr-FR")}` : ""}.
        </p>
        <Link
          href="/espace/formations"
          className="mt-8 inline-block border border-[var(--noir)] bg-[var(--noir)] px-8 py-4 text-xs uppercase tracking-[0.14em] text-[var(--porcelaine)]"
        >
          Voir mes formations
        </Link>
      </section>
    );
  }

  const passEnAttente = await prisma.pass.findFirst({
    where: { eleveId: session.userId, statut: "EN_ATTENTE_PAIEMENT" },
  });

  const [paiement, coordonnees] = await Promise.all([getInfosPaiement(), getCoordonnees()]);
  const moyens = [
    { label: "Wave", valeur: paiement.wave },
    { label: "Orange Money", valeur: paiement.orangeMoney },
    { label: "Free Money", valeur: paiement.freeMoney },
  ].filter((m) => m.valeur);

  const enAttente = Boolean(passEnAttente);

  return (
    <section className="mx-auto max-w-md px-6 py-20">
      <p className="text-4xl">👑</p>
      <h1 className="font-display mt-3 text-2xl uppercase tracking-[0.12em]">Radiaglam Academy Pass</h1>
      {prix && <p className="mt-2 font-display text-xl">{prix} FCFA</p>}

      {(enAttente || demande === "1") && (
        <p className="mt-6 border border-[var(--brass)] bg-[var(--blush)] px-4 py-3 text-sm">
          ✓ Votre demande de Pass est enregistree. Effectuez le paiement ci-dessous : votre acces
          sera active des confirmation par notre equipe.
        </p>
      )}

      <div className="mt-8 border border-[var(--noir)] bg-white p-6">
        <h2 className="font-display text-sm uppercase tracking-[0.12em]">
          Regler {prix ?? "le montant"} FCFA
        </h2>
        {moyens.length > 0 ? (
          <ul className="mt-4 flex flex-col gap-3 text-sm">
            {moyens.map((m) => (
              <li key={m.label} className="flex items-center justify-between border-b border-[var(--ligne)] pb-2">
                <span className="uppercase tracking-[0.1em] text-[var(--gris)]">{m.label}</span>
                <span className="font-medium">{m.valeur}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-[var(--gris)]">
            Les coordonnees de paiement seront communiquees par notre equipe.
          </p>
        )}
        {coordonnees.whatsapp && (
          <p className="mt-4 text-xs text-[var(--gris)]">
            Apres paiement, envoyez votre recu au {coordonnees.whatsapp} (WhatsApp) pour un deblocage
            plus rapide.
          </p>
        )}
      </div>

      {!enAttente && (
        <form action={demanderPass} className="mt-6">
          <button
            type="submit"
            className="w-full border border-[var(--noir)] bg-[var(--noir)] px-6 py-4 text-xs uppercase tracking-[0.14em] text-[var(--porcelaine)] hover:bg-[var(--brass)] hover:text-[var(--noir)]"
          >
            Je reserve mon Pass
          </button>
          <p className="mt-3 text-center text-xs text-[var(--gris)]">
            L&apos;acces a toutes les formations est active apres confirmation du paiement.
          </p>
        </form>
      )}

      {enAttente && (
        <p className="mt-6 text-center text-xs uppercase tracking-[0.1em] text-[var(--gris)]">
          <Link href="/espace/formations" className="underline">
            Voir mes formations
          </Link>
        </p>
      )}

      {backLink}
    </section>
  );
}
