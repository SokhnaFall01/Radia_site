-- CreateTable
CREATE TABLE "HoraireOuverture" (
    "id" TEXT NOT NULL,
    "jour" INTEGER NOT NULL,
    "ouvert" BOOLEAN NOT NULL DEFAULT true,
    "heureDebut" TEXT NOT NULL,
    "heureFin" TEXT NOT NULL,

    CONSTRAINT "HoraireOuverture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JourFerme" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "motif" TEXT,

    CONSTRAINT "JourFerme_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HoraireOuverture_jour_key" ON "HoraireOuverture"("jour");

-- CreateIndex
CREATE UNIQUE INDEX "JourFerme_date_key" ON "JourFerme"("date");
