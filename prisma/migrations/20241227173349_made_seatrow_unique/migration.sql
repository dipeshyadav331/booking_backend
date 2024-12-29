/*
  Warnings:

  - A unique constraint covering the columns `[seatrow]` on the table `Seats` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Seats_seatrow_key" ON "Seats"("seatrow");
