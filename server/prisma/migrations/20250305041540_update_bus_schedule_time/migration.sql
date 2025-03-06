/*
  Warnings:

  - You are about to drop the column `fare` on the `bus_routes` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `bus_schedules` table. All the data in the column will be lost.
  - The `status` column on the `bus_schedules` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[stopName,routeId]` on the table `bus_stops` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ScheduleStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'DELAYED', 'PENDING');

-- CreateEnum
CREATE TYPE "MaintenanceType" AS ENUM ('ROUTINE', 'REPAIR', 'INSPECTION');

-- CreateEnum
CREATE TYPE "BusType" AS ENUM ('SHUTTLE', 'MINIBUS', 'ARTICULATED');

-- CreateEnum
CREATE TYPE "FrequencyType" AS ENUM ('DAILY', 'WEEKDAYS', 'WEEKLY');

-- CreateEnum
CREATE TYPE "Direction" AS ENUM ('CLOCKWISE', 'COUNTER_CLOCKWISE');

-- DropForeignKey
ALTER TABLE "bus_routes" DROP CONSTRAINT "bus_routes_busId_fkey";

-- DropForeignKey
ALTER TABLE "bus_schedules" DROP CONSTRAINT "bus_schedules_busId_fkey";

-- DropForeignKey
ALTER TABLE "bus_schedules" DROP CONSTRAINT "bus_schedules_routeId_fkey";

-- DropForeignKey
ALTER TABLE "bus_stops" DROP CONSTRAINT "bus_stops_routeId_fkey";

-- AlterTable
ALTER TABLE "bus_routes" DROP COLUMN "fare",
ADD COLUMN     "direction" "Direction",
ADD COLUMN     "routeCode" TEXT;

-- AlterTable
ALTER TABLE "bus_schedules" DROP COLUMN "isActive",
ADD COLUMN     "availableSeats" INTEGER NOT NULL DEFAULT 50,
ADD COLUMN     "bookedSeats" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "driverId" TEXT,
ADD COLUMN     "frequency" "FrequencyType" NOT NULL DEFAULT 'DAILY',
ADD COLUMN     "isRecurring" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "recurrencePattern" TEXT,
ADD COLUMN     "totalCapacity" INTEGER NOT NULL DEFAULT 50,
ADD COLUMN     "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "validUntil" TIMESTAMP(3),
ALTER COLUMN "departureTime" SET DATA TYPE TEXT,
ALTER COLUMN "arrivalTime" SET DATA TYPE TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "ScheduleStatus" NOT NULL DEFAULT 'SCHEDULED';

-- AlterTable
ALTER TABLE "bus_stops" ADD COLUMN     "campusZone" TEXT,
ADD COLUMN     "timeFromStart" INTEGER;

-- AlterTable
ALTER TABLE "buses" ADD COLUMN     "licensePlate" TEXT,
ADD COLUMN     "type" "BusType";

-- CreateTable
CREATE TABLE "drivers" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "licenseNumber" TEXT NOT NULL,
    "phone" TEXT,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "availability" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drivers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_logs" (
    "id" TEXT NOT NULL,
    "busId" TEXT NOT NULL,
    "maintenanceDate" TIMESTAMP(3) NOT NULL,
    "type" "MaintenanceType" NOT NULL,
    "description" TEXT NOT NULL,
    "cost" DECIMAL(10,2),
    "nextDueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenance_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reminders" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "reminderTime" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reminders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_BusToDriver" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "drivers_licenseNumber_key" ON "drivers"("licenseNumber");

-- CreateIndex
CREATE INDEX "drivers_isAvailable_idx" ON "drivers"("isAvailable");

-- CreateIndex
CREATE INDEX "maintenance_logs_maintenanceDate_idx" ON "maintenance_logs"("maintenanceDate");

-- CreateIndex
CREATE INDEX "reminders_reminderTime_idx" ON "reminders"("reminderTime");

-- CreateIndex
CREATE INDEX "reminders_studentId_idx" ON "reminders"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "_BusToDriver_AB_unique" ON "_BusToDriver"("A", "B");

-- CreateIndex
CREATE INDEX "_BusToDriver_B_index" ON "_BusToDriver"("B");

-- CreateIndex
CREATE INDEX "bus_routes_isActive_idx" ON "bus_routes"("isActive");

-- CreateIndex
CREATE INDEX "bus_schedules_status_idx" ON "bus_schedules"("status");

-- CreateIndex
CREATE INDEX "bus_schedules_validFrom_idx" ON "bus_schedules"("validFrom");

-- CreateIndex
CREATE INDEX "bus_stops_routeId_idx" ON "bus_stops"("routeId");

-- CreateIndex
CREATE UNIQUE INDEX "bus_stops_stopName_routeId_key" ON "bus_stops"("stopName", "routeId");

-- AddForeignKey
ALTER TABLE "bus_routes" ADD CONSTRAINT "bus_routes_busId_fkey" FOREIGN KEY ("busId") REFERENCES "buses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bus_stops" ADD CONSTRAINT "bus_stops_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "bus_routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bus_schedules" ADD CONSTRAINT "bus_schedules_busId_fkey" FOREIGN KEY ("busId") REFERENCES "buses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bus_schedules" ADD CONSTRAINT "bus_schedules_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "bus_routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bus_schedules" ADD CONSTRAINT "bus_schedules_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_logs" ADD CONSTRAINT "maintenance_logs_busId_fkey" FOREIGN KEY ("busId") REFERENCES "buses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "bus_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BusToDriver" ADD CONSTRAINT "_BusToDriver_A_fkey" FOREIGN KEY ("A") REFERENCES "buses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BusToDriver" ADD CONSTRAINT "_BusToDriver_B_fkey" FOREIGN KEY ("B") REFERENCES "drivers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
