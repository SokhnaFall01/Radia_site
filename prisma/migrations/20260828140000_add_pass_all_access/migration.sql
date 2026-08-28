-- CreateEnum
CREATE TYPE "StatutPass" AS ENUM ('EN_ATTENTE_PAIEMENT', 'ACTIF', 'EXPIRE', 'ANNULE');

-- CreateTable
CREATE TABLE "Pass" (
    "id" TEXT NOT NULL,
    "eleveId" TEXT NOT NULL,
    "prixFcfa" INTEGER NOT NULL,
    "statut" "StatutPass" NOT NULL DEFAULT 'EN_ATTENTE_PAIEMENT',
    "dateDebut" TIMESTAMP(3),
    "dateFin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pass_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Pass_eleveId_idx" ON "Pass"("eleveId");
CREATE INDEX "Pass_statut_idx" ON "Pass"("statut");

-- AddForeignKey
ALTER TABLE "Pass" ADD CONSTRAINT "Pass_eleveId_fkey" FOREIGN KEY ("eleveId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
