-- CreateTable
CREATE TABLE "Seats" (
    "id" SERIAL NOT NULL,
    "seatbit" VARCHAR(7) NOT NULL,
    "seatrow" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Seats_pkey" PRIMARY KEY ("id")
);
