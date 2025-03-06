/*
  Warnings:

  - The primary key for the `menu_meals` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `meal_id` on the `menu_meals` table. All the data in the column will be lost.
  - You are about to drop the column `menu_id` on the `menu_meals` table. All the data in the column will be lost.
  - You are about to drop the column `menu_meal_id` on the `menu_meals` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `menu_meals` table. All the data in the column will be lost.
  - The primary key for the `menus` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `menu_id` on the `menus` table. All the data in the column will be lost.
  - You are about to drop the `Preorder` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `mealId` to the `menu_meals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `menuId` to the `menu_meals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `menu_meals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `menus` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Preorder" DROP CONSTRAINT "Preorder_menuMealId_fkey";

-- DropForeignKey
ALTER TABLE "Preorder" DROP CONSTRAINT "Preorder_userId_fkey";

-- DropForeignKey
ALTER TABLE "menu_meals" DROP CONSTRAINT "menu_meals_meal_id_fkey";

-- DropForeignKey
ALTER TABLE "menu_meals" DROP CONSTRAINT "menu_meals_menu_id_fkey";

-- AlterTable
ALTER TABLE "menu_meals" DROP CONSTRAINT "menu_meals_pkey",
DROP COLUMN "meal_id",
DROP COLUMN "menu_id",
DROP COLUMN "menu_meal_id",
DROP COLUMN "price",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "mealId" INTEGER NOT NULL,
ADD COLUMN     "menuId" INTEGER NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD CONSTRAINT "menu_meals_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "menus" DROP CONSTRAINT "menus_pkey",
DROP COLUMN "menu_id",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "date" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "menus_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "Preorder";

-- CreateTable
CREATE TABLE "preorders" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "menuMealId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'placed',
    "orderTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pickupTime" TIMESTAMP(3) NOT NULL,
    "verificationCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "preorders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "preorders_verificationCode_key" ON "preorders"("verificationCode");

-- AddForeignKey
ALTER TABLE "menu_meals" ADD CONSTRAINT "menu_meals_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "menus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_meals" ADD CONSTRAINT "menu_meals_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "meals"("meal_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preorders" ADD CONSTRAINT "preorders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preorders" ADD CONSTRAINT "preorders_menuMealId_fkey" FOREIGN KEY ("menuMealId") REFERENCES "menu_meals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
