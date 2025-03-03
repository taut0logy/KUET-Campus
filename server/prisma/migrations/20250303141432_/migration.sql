/*
  Warnings:

  - Added the required column `category` to the `meals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `meals` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "meals" ADD COLUMN     "allergens" JSONB,
ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "isGlutenFree" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isVegan" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "price" DECIMAL(65,30) NOT NULL;
