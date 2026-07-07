-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CLIENTE', 'STAFF', 'ADMIN');

-- CreateEnum
CREATE TYPE "StatutRdv" AS ENUM ('EN_ATTENTE', 'CONFIRME', 'HONORE', 'ABSENT', 'ANNULE');

-- CreateEnum
CREATE TYPE "OrigineRdv" AS ENUM ('EN_LIGNE', 'MANUEL');

-- CreateEnum
CREATE TYPE "StatutInscription" AS ENUM ('CONFIRMEE', 'LISTE_ATTENTE', 'ANNULEE');

-- CreateEnum
CREATE TYPE "StatutCommande" AS ENUM ('PAYEE', 'PREPAREE', 'LIVREE', 'ANNULEE');

-- CreateEnum
CREATE TYPE "TypeLivraison" AS ENUM ('LIVRAISON', 'RETRAIT_SALON');

-- CreateEnum
CREATE TYPE "TypePaiement" AS ENUM ('FORMATION', 'RENDEZ_VOUS', 'BOUTIQUE');

-- CreateEnum
CREATE TYPE "MoyenPaiement" AS ENUM ('WAVE', 'ORANGE_MONEY', 'FREE_MONEY', 'CARTE_BANCAIRE', 'ESPECES_SALON');

-- CreateEnum
CREATE TYPE "StatutPaiement" AS ENUM ('EN_ATTENTE', 'PARTIEL', 'PAYE', 'ECHOUE', 'REMBOURSE');

-- CreateEnum
CREATE TYPE "CanalNotification" AS ENUM ('WHATSAPP', 'EMAIL');

-- CreateEnum
CREATE TYPE "TypeNotification" AS ENUM ('CONFIRMATION', 'RAPPEL', 'ANNONCE', 'RECU');

-- CreateEnum
CREATE TYPE "StatutEnvoi" AS ENUM ('EN_ATTENTE', 'ENVOYE', 'ECHOUE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telephone" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'CLIENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Formation" (
    "id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "programme" TEXT NOT NULL,
    "duree" TEXT NOT NULL,
    "tarifFcfa" INTEGER NOT NULL,
    "niveau" TEXT NOT NULL,
    "photos" TEXT[],
    "publie" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Formation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sessionformation" (
    "id" TEXT NOT NULL,
    "formationId" TEXT NOT NULL,
    "dateDebut" TIMESTAMP(3) NOT NULL,
    "dateFin" TIMESTAMP(3) NOT NULL,
    "placesMax" INTEGER NOT NULL,
    "placesRestantes" INTEGER NOT NULL,

    CONSTRAINT "Sessionformation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inscription" (
    "id" TEXT NOT NULL,
    "eleveId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "statut" "StatutInscription" NOT NULL DEFAULT 'CONFIRMEE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Inscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lecon" (
    "id" TEXT NOT NULL,
    "formationId" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "ordre" INTEGER NOT NULL,
    "videoUrl" TEXT,
    "pdfUrl" TEXT,

    CONSTRAINT "Lecon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quiz" (
    "id" TEXT NOT NULL,
    "leconId" TEXT NOT NULL,
    "questions" JSONB NOT NULL,

    CONSTRAINT "Quiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Progression" (
    "id" TEXT NOT NULL,
    "eleveId" TEXT NOT NULL,
    "leconId" TEXT NOT NULL,
    "terminee" BOOLEAN NOT NULL DEFAULT false,
    "score" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Progression_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certificat" (
    "id" TEXT NOT NULL,
    "inscriptionId" TEXT NOT NULL,
    "eleveId" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "pdfUrl" TEXT,
    "delivreLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Certificat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prestation" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "dureeMinutes" INTEGER NOT NULL,
    "prixFcfa" INTEGER NOT NULL,
    "acompteRequis" INTEGER,
    "photo" TEXT,
    "actif" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Prestation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RendezVous" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "prestationId" TEXT NOT NULL,
    "maquilleuseId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "statut" "StatutRdv" NOT NULL DEFAULT 'EN_ATTENTE',
    "origine" "OrigineRdv" NOT NULL DEFAULT 'EN_LIGNE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RendezVous_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Produit" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prixFcfa" INTEGER NOT NULL,
    "photos" TEXT[],
    "categorie" TEXT NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "seuilAlerte" INTEGER NOT NULL DEFAULT 5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Produit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Commande" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "totalFcfa" INTEGER NOT NULL,
    "livraison" "TypeLivraison" NOT NULL,
    "adresse" TEXT,
    "statut" "StatutCommande" NOT NULL DEFAULT 'PAYEE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Commande_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LigneCommande" (
    "id" TEXT NOT NULL,
    "commandeId" TEXT NOT NULL,
    "produitId" TEXT NOT NULL,
    "quantite" INTEGER NOT NULL,
    "prixUnitaire" INTEGER NOT NULL,

    CONSTRAINT "LigneCommande_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Paiement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "montantFcfa" INTEGER NOT NULL,
    "moyen" "MoyenPaiement" NOT NULL,
    "type" "TypePaiement" NOT NULL,
    "estAcompte" BOOLEAN NOT NULL DEFAULT false,
    "resteDuFcfa" INTEGER NOT NULL DEFAULT 0,
    "referenceExt" TEXT,
    "statut" "StatutPaiement" NOT NULL DEFAULT 'EN_ATTENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rendezVousId" TEXT,
    "commandeId" TEXT,

    CONSTRAINT "Paiement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContenuSite" (
    "id" TEXT NOT NULL,
    "cle" TEXT NOT NULL,
    "valeur" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContenuSite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "destinataireId" TEXT NOT NULL,
    "canal" "CanalNotification" NOT NULL,
    "type" "TypeNotification" NOT NULL,
    "statut" "StatutEnvoi" NOT NULL DEFAULT 'EN_ATTENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "Sessionformation_formationId_idx" ON "Sessionformation"("formationId");

-- CreateIndex
CREATE INDEX "Inscription_sessionId_idx" ON "Inscription"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Inscription_eleveId_sessionId_key" ON "Inscription"("eleveId", "sessionId");

-- CreateIndex
CREATE INDEX "Lecon_formationId_idx" ON "Lecon"("formationId");

-- CreateIndex
CREATE UNIQUE INDEX "Quiz_leconId_key" ON "Quiz"("leconId");

-- CreateIndex
CREATE UNIQUE INDEX "Progression_eleveId_leconId_key" ON "Progression"("eleveId", "leconId");

-- CreateIndex
CREATE UNIQUE INDEX "Certificat_inscriptionId_key" ON "Certificat"("inscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "Certificat_numero_key" ON "Certificat"("numero");

-- CreateIndex
CREATE INDEX "RendezVous_date_idx" ON "RendezVous"("date");

-- CreateIndex
CREATE INDEX "RendezVous_maquilleuseId_idx" ON "RendezVous"("maquilleuseId");

-- CreateIndex
CREATE INDEX "LigneCommande_commandeId_idx" ON "LigneCommande"("commandeId");

-- CreateIndex
CREATE UNIQUE INDEX "Paiement_rendezVousId_key" ON "Paiement"("rendezVousId");

-- CreateIndex
CREATE UNIQUE INDEX "Paiement_commandeId_key" ON "Paiement"("commandeId");

-- CreateIndex
CREATE INDEX "Paiement_userId_idx" ON "Paiement"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ContenuSite_cle_key" ON "ContenuSite"("cle");

-- CreateIndex
CREATE INDEX "Notification_destinataireId_idx" ON "Notification"("destinataireId");

-- AddForeignKey
ALTER TABLE "Sessionformation" ADD CONSTRAINT "Sessionformation_formationId_fkey" FOREIGN KEY ("formationId") REFERENCES "Formation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inscription" ADD CONSTRAINT "Inscription_eleveId_fkey" FOREIGN KEY ("eleveId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inscription" ADD CONSTRAINT "Inscription_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Sessionformation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lecon" ADD CONSTRAINT "Lecon_formationId_fkey" FOREIGN KEY ("formationId") REFERENCES "Formation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_leconId_fkey" FOREIGN KEY ("leconId") REFERENCES "Lecon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Progression" ADD CONSTRAINT "Progression_eleveId_fkey" FOREIGN KEY ("eleveId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Progression" ADD CONSTRAINT "Progression_leconId_fkey" FOREIGN KEY ("leconId") REFERENCES "Lecon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificat" ADD CONSTRAINT "Certificat_inscriptionId_fkey" FOREIGN KEY ("inscriptionId") REFERENCES "Inscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificat" ADD CONSTRAINT "Certificat_eleveId_fkey" FOREIGN KEY ("eleveId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RendezVous" ADD CONSTRAINT "RendezVous_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RendezVous" ADD CONSTRAINT "RendezVous_prestationId_fkey" FOREIGN KEY ("prestationId") REFERENCES "Prestation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RendezVous" ADD CONSTRAINT "RendezVous_maquilleuseId_fkey" FOREIGN KEY ("maquilleuseId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commande" ADD CONSTRAINT "Commande_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LigneCommande" ADD CONSTRAINT "LigneCommande_commandeId_fkey" FOREIGN KEY ("commandeId") REFERENCES "Commande"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LigneCommande" ADD CONSTRAINT "LigneCommande_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "Produit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paiement" ADD CONSTRAINT "Paiement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paiement" ADD CONSTRAINT "Paiement_rendezVousId_fkey" FOREIGN KEY ("rendezVousId") REFERENCES "RendezVous"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paiement" ADD CONSTRAINT "Paiement_commandeId_fkey" FOREIGN KEY ("commandeId") REFERENCES "Commande"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_destinataireId_fkey" FOREIGN KEY ("destinataireId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
