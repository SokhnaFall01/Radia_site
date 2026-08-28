-- CreateEnum
CREATE TYPE "CategorieFormation" AS ENUM ('MAQUILLAGE', 'PERFECTIONNEMENT', 'BUSINESS', 'MASTERCLASS');

-- CreateEnum
CREATE TYPE "ModeFormation" AS ENUM ('EN_LIGNE', 'PRESENTIEL');

-- AlterEnum
ALTER TYPE "StatutInscription" ADD VALUE 'EN_ATTENTE_PAIEMENT';

-- AlterTable: Formation — champs page de vente / catalogue
ALTER TABLE "Formation" ADD COLUMN     "categorie" "CategorieFormation" NOT NULL DEFAULT 'MAQUILLAGE',
ADD COLUMN     "mode" "ModeFormation" NOT NULL DEFAULT 'EN_LIGNE',
ADD COLUMN     "promesse" TEXT,
ADD COLUMN     "objectifs" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "pourQui" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "inclus" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "videoIntroUrl" TEXT,
ADD COLUMN     "dureeVideo" TEXT,
ADD COLUMN     "ordreAffichage" INTEGER NOT NULL DEFAULT 0;

-- AlterTable: Inscription — lien direct vers la formation + session optionnelle
ALTER TABLE "Inscription" ADD COLUMN "formationId" TEXT;

-- Backfill du formationId depuis la session existante (formations presentielles)
UPDATE "Inscription" i
SET "formationId" = s."formationId"
FROM "Sessionformation" s
WHERE i."sessionId" = s."id" AND i."formationId" IS NULL;

-- La colonne devient obligatoire une fois renseignee
ALTER TABLE "Inscription" ALTER COLUMN "formationId" SET NOT NULL;

-- La session devient optionnelle (inscriptions digitales sans session)
ALTER TABLE "Inscription" ALTER COLUMN "sessionId" DROP NOT NULL;

-- DropIndex / DropForeignKey remplaces
DROP INDEX "Inscription_eleveId_sessionId_key";
ALTER TABLE "Inscription" DROP CONSTRAINT "Inscription_sessionId_fkey";

-- CreateIndex
CREATE INDEX "Formation_categorie_idx" ON "Formation"("categorie");
CREATE INDEX "Formation_mode_idx" ON "Formation"("mode");
CREATE INDEX "Inscription_formationId_idx" ON "Inscription"("formationId");
CREATE UNIQUE INDEX "Inscription_eleveId_formationId_key" ON "Inscription"("eleveId", "formationId");

-- AddForeignKey
ALTER TABLE "Inscription" ADD CONSTRAINT "Inscription_formationId_fkey" FOREIGN KEY ("formationId") REFERENCES "Formation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Inscription" ADD CONSTRAINT "Inscription_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Sessionformation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
