import Link from "next/link";
import { notFound } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { getInfosPaiement, getCoordonnees } from "@/lib/contenu";
import { demanderInscriptionFormation } from "@/lib/actions/lms";

export const metadata = { title: "Acheter ma formation — Radia Glam Academy" };

export default async function AcheterFormationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ demande?: string }>;
}) {
  const { id } = await params;
  const { demande } = await searchParams;

  const formation = await prisma.formation.findUnique({ where: { id } });
  if (!formation || !formation.publie) notFound();
  if (formation.mode !== "EN_LIGNE") {
    // Les formations en presentiel ne se paient pas en ligne : on renvoie a la page de vente.
    return notFound();
  }

  const prix = formation.tarifFcfa.toLocaleString("fr-FR");
  const session = await verifySession();

  const backLink = (
    <p className="mt-10 text-xs uppercase tracking-[0.1em] text-[var(--gris)]">
      <Link href={`/academy/${formation.id}`} className="underline">
        &larr; Revenir à la présentation
      </Link>
    </p>
  );

  // 1) Non connectee : inviter a creer un compte / se connecter (retour ici ensuite)
  if (!session) {
    const next = encodeURIComponent(`/academy/${formation.id}/acheter`);
    return (
      <section className="mx-auto max-w-md px-6 py-20">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--brass)]">Radia Glam Academy</p>
        <h1 className="font-display mt-3 text-2xl uppercase tracking-[0.12em]">{formation.titre}</h1>
        <p className="mt-2 font-display text-xl">{prix} FCFA</p>
        <p className="mt-6 text-sm text-[var(--gris)]">
          Pour accéder à votre formation, créez votre compte (ou connectez-vous). Votre espace
          personnel vous permettra de suivre les modules et de télécharger votre certificat.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Link
            href={`/inscription?next=${next}`}
            className="border border-[var(--noir)] bg-[var(--noir)] px-6 py-4 text-center text-xs uppercase tracking-[0.14em] text-[var(--porcelaine)]"
          >
            Créer mon compte
          </Link>
          <Link
            href={`/connexion?next=${next}`}
            className="border border-[var(--noir)] px-6 py-4 text-center text-xs uppercase tracking-[0.14em] hover:bg-[var(--noir)] hover:text-[var(--porcelaine)]"
          >
            J&apos;ai déjà un compte
          </Link>
        </div>
        {backLink}
      </section>
    );
  }

  // 2) Deja inscrite : etat en fonction du statut
  const inscription = await prisma.inscription.findUnique({
    where: { eleveId_formationId: { eleveId: session.userId, formationId: formation.id } },
  });

  if (inscription?.statut === "CONFIRMEE") {
    return (
      <section className="mx-auto max-w-md px-6 py-20 text-center">
        <p className="text-3xl">🎓</p>
        <h1 className="font-display mt-4 text-2xl uppercase tracking-[0.12em]">Accès débloqué</h1>
        <p className="mt-4 text-sm text-[var(--gris)]">
          Vous avez déjà accès à « {formation.titre} ».
        </p>
        <Link
          href={`/espace/formations/${formation.id}`}
          className="mt-8 inline-block border border-[var(--noir)] bg-[var(--noir)] px-8 py-4 text-xs uppercase tracking-[0.14em] text-[var(--porcelaine)]"
        >
          Accéder à ma formation
        </Link>
      </section>
    );
  }

  const [paiement, coordonnees] = await Promise.all([getInfosPaiement(), getCoordonnees()]);
  const moyens = [
    { label: "Wave", valeur: paiement.wave },
    { label: "Orange Money", valeur: paiement.orangeMoney },
    { label: "Free Money", valeur: paiement.freeMoney },
  ].filter((m) => m.valeur);

  const enAttente = inscription?.statut === "EN_ATTENTE_PAIEMENT";

  return (
    <section className="mx-auto max-w-md px-6 py-20">
      <p className="text-xs uppercase tracking-[0.2em] text-[var(--brass)]">Radia Glam Academy</p>
      <h1 className="font-display mt-3 text-2xl uppercase tracking-[0.12em]">{formation.titre}</h1>
      <p className="mt-2 font-display text-xl">{prix} FCFA</p>

      {(enAttente || demande === "1") && (
        <p className="mt-6 border border-[var(--brass)] bg-[var(--blush)] px-4 py-3 text-sm">
          ✓ Votre demande est enregistrée. Effectuez le paiement ci-dessous : votre formation sera
          débloquée dès confirmation par notre équipe.
        </p>
      )}

      {/* Coordonnees de paiement */}
      <div className="mt-8 border border-[var(--noir)] bg-white p-6">
        <h2 className="font-display text-sm uppercase tracking-[0.12em]">Régler {prix} FCFA</h2>
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
            Les coordonnées de paiement seront communiquées par notre équipe.
          </p>
        )}
        {paiement.instructions && (
          <p className="mt-4 text-xs text-[var(--gris)]">{paiement.instructions}</p>
        )}
        {coordonnees.whatsapp && (
          <p className="mt-4 text-xs text-[var(--gris)]">
            Après paiement, envoyez votre reçu au {coordonnees.whatsapp} (WhatsApp) pour un déblocage
            plus rapide.
          </p>
        )}
      </div>

      {!enAttente && (
        <form action={demanderInscriptionFormation.bind(null, formation.id)} className="mt-6">
          <button
            type="submit"
            className="w-full border border-[var(--noir)] bg-[var(--noir)] px-6 py-4 text-xs uppercase tracking-[0.14em] text-[var(--porcelaine)] hover:bg-[var(--brass)] hover:text-[var(--noir)]"
          >
            Je réserve ma formation
          </button>
          <p className="mt-3 text-center text-xs text-[var(--gris)]">
            Vous réservez votre place ; l&apos;accès est activé après confirmation du paiement.
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
