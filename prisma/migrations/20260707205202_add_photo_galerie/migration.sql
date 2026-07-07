-- CreateTable
CREATE TABLE "PhotoGalerie" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "legende" TEXT,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PhotoGalerie_pkey" PRIMARY KEY ("id")
);
