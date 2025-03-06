/*
  Warnings:

  - You are about to drop the column `menuMealId` on the `preorders` table. All the data in the column will be lost.
  - You are about to drop the `menu_meals` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `menus` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `mealId` to the `preorders` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "menu_meals" DROP CONSTRAINT "menu_meals_mealId_fkey";

-- DropForeignKey
ALTER TABLE "menu_meals" DROP CONSTRAINT "menu_meals_menuId_fkey";

-- DropForeignKey
ALTER TABLE "preorders" DROP CONSTRAINT "preorders_menuMealId_fkey";

-- AlterTable
ALTER TABLE "preorders" DROP COLUMN "menuMealId",
ADD COLUMN     "mealId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "menu_meals";

-- DropTable
DROP TABLE "menus";

-- AddForeignKey
ALTER TABLE "preorders" ADD CONSTRAINT "preorders_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "meals"("meal_id") ON DELETE RESTRICT ON UPDATE CASCADE;
