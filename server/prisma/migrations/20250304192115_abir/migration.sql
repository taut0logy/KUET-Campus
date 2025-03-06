/*
  Warnings:

  - You are about to drop the `preorders` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "preorders" DROP CONSTRAINT "preorders_menu_meal_id_fkey";

-- DropForeignKey
ALTER TABLE "preorders" DROP CONSTRAINT "preorders_user_id_fkey";

-- DropTable
DROP TABLE "preorders";

-- CreateTable
CREATE TABLE "Preorder" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "menuMealId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'placed',
    "orderTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pickupTime" TIMESTAMP(3) NOT NULL,
    "verificationCode" TEXT NOT NULL,
    "qrCode" TEXT,
    "notes" TEXT,
    "rating" INTEGER DEFAULT 0,
    "feedback" TEXT,

    CONSTRAINT "Preorder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Preorder_verificationCode_key" ON "Preorder"("verificationCode");

-- AddForeignKey
ALTER TABLE "Preorder" ADD CONSTRAINT "Preorder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Preorder" ADD CONSTRAINT "Preorder_menuMealId_fkey" FOREIGN KEY ("menuMealId") REFERENCES "menu_meals"("menu_meal_id") ON DELETE RESTRICT ON UPDATE CASCADE;
