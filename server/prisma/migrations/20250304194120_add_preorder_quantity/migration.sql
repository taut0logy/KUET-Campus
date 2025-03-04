/*
  Warnings:

  - The primary key for the `Preorder` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `feedback` on the `Preorder` table. All the data in the column will be lost.
  - You are about to drop the column `qrCode` on the `Preorder` table. All the data in the column will be lost.
  - You are about to drop the column `rating` on the `Preorder` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Preorder" DROP CONSTRAINT "Preorder_pkey",
DROP COLUMN "feedback",
DROP COLUMN "qrCode",
DROP COLUMN "rating",
ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 1,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Preorder_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Preorder_id_seq";

-- CreateIndex
CREATE INDEX "Preorder_userId_idx" ON "Preorder"("userId");

-- CreateIndex
CREATE INDEX "Preorder_menuMealId_idx" ON "Preorder"("menuMealId");
