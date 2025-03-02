// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // OPTIONAL: Clear existing data in a specific order due to relations
  await prisma.preorder.deleteMany();
  await prisma.menuMeal.deleteMany();
  await prisma.menu.deleteMany();
  await prisma.meal.deleteMany();

  // -------------------------
  // Create demo meals
  // -------------------------
  const meal1 = await prisma.meal.create({
    data: {
      name: "Spaghetti Bolognese",
      description: "Classic Italian pasta with a rich meat sauce.",
      nutrition: { calories: 500, protein: 25 },
    },
  });

  const meal2 = await prisma.meal.create({
    data: {
      name: "Grilled Chicken Salad",
      description: "Fresh salad topped with grilled chicken and a light dressing.",
      nutrition: { calories: 350, protein: 30 },
    },
  });

  // -------------------------
  // Create a demo menu for today
  // -------------------------
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize the time

  const menu = await prisma.menu.create({
    data: { date: today },
  });

  // -------------------------
  // Create menu meals for the menu
  // -------------------------
  const menuMeal1 = await prisma.menuMeal.create({
    data: {
      menuId: menu.id,
      mealId: meal1.id,
      price: 9.99,
      available: true,
    },
  });

  const menuMeal2 = await prisma.menuMeal.create({
    data: {
      menuId: menu.id,
      mealId: meal2.id,
      price: 11.99,
      available: true,
    },
  });

  // -------------------------
  // OPTIONAL: Create a demo preorder (if you want demo orders)
  // -------------------------
  // Replace 'demo-user-id' with an actual user id from your users table
  // const preorder = await prisma.preorder.create({
  //   data: {
  //     userId: "demo-user-id",
  //     menuMealId: menuMeal1.id,
  //     status: "placed",
  //   },
  // });

  console.log("Database has been seeded. Demo data:");
  console.log({ meal1, meal2, menu, menuMeal1, menuMeal2 });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
