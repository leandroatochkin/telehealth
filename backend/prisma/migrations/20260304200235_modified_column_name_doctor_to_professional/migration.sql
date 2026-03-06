/*
  Warnings:

  - You are about to drop the column `doctorId` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the column `doctorJoinedAt` on the `Appointment` table. All the data in the column will be lost.
  - Added the required column `professionalId` to the `Appointment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_doctorId_fkey";

-- DropIndex
DROP INDEX "Appointment_doctorId_startTime_idx";

-- AlterTable
ALTER TABLE "Appointment" DROP COLUMN "doctorId",
DROP COLUMN "doctorJoinedAt",
ADD COLUMN     "professionalId" TEXT NOT NULL,
ADD COLUMN     "professionalJoinedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Appointment_professionalId_startTime_idx" ON "Appointment"("professionalId", "startTime");

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
