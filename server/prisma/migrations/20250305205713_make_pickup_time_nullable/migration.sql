/*
  Warnings:

  - You are about to drop the `locations` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "preorders" ADD COLUMN     "rejectionReason" TEXT,
ALTER COLUMN "status" SET DEFAULT 'pending_approval',
ALTER COLUMN "pickupTime" DROP NOT NULL;

-- DropTable
DROP TABLE "locations";
