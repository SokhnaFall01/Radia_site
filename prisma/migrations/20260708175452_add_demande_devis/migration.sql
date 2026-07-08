-- CreateEnum
CREATE TYPE "TypeEvenement" AS ENUM ('MARIAGE', 'HENNE', 'MAQUILLAGE_SIMPLE', 'AUTRE');

-- CreateEnum
CREATE TYPE "StatutDevis" AS ENUM ('NOUVEAU', 'EN_COURS', 'ENVOYE', 'ACCEPTE', 'REFUSE');

-- CreateTable
CREATE TABLE "DemandeDevis" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "email" TEXT,
    "typeEvenement" "TypeEvenement" NOT NULL,
    "precision" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "ville" TEXT NOT NULL,
    "message" TEXT,
    "statut" "StatutDevis" NOT NULL DEFAULT 'NOUVEAU',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,

    CONSTRAINT "DemandeDevis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DemandeDevis_statut_idx" ON "DemandeDevis"("statut");

-- AddForeignKey
ALTER TABLE "DemandeDevis" ADD CONSTRAINT "DemandeDevis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
