/*
  Warnings:

  - You are about to drop the column `nutrition` on the `meals` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "meals" DROP COLUMN "nutrition",
ADD COLUMN     "calcium" INTEGER,
ADD COLUMN     "calories" INTEGER,
ADD COLUMN     "carbs" INTEGER,
ADD COLUMN     "fat" INTEGER,
ADD COLUMN     "fiber" INTEGER,
ADD COLUMN     "iron" INTEGER,
ADD COLUMN     "isLowFat" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isOrganic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isSugarFree" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "protein" INTEGER,
ADD COLUMN     "sodium" INTEGER,
ADD COLUMN     "sugar" INTEGER,
ADD COLUMN     "vitaminA" INTEGER,
ADD COLUMN     "vitaminC" INTEGER;
