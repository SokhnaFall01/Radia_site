-- AlterEnum
ALTER TYPE "StatutCommande" ADD VALUE 'EN_ATTENTE';

-- AlterTable
ALTER TABLE "Commande" ALTER COLUMN "statut" SET DEFAULT 'EN_ATTENTE';
