import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.meal.createMany({
    data: [
      {
        name: "Grilled Chicken Salad",
        description: "A healthy mix of grilled chicken, fresh greens, and vinaigrette dressing.",
        nutrition: {
          calories: 350,
          protein: 40,
          carbs: 15,
          fat: 10,
        },
        price: 8.99,
        category: "Salad",
        isVegan: false,
        isGlutenFree: true,
        allergens: ["None"],
      },
      {
        name: "Vegan Buddha Bowl",
        description: "A balanced bowl with quinoa, chickpeas, avocado, and tahini dressing.",
        nutrition: {
          calories: 500,
          protein: 20,
          carbs: 55,
          fat: 15,
        },
        price: 10.99,
        category: "Vegan",
        isVegan: true,
        isGlutenFree: true,
        allergens: ["Sesame"],
      },
      {
        name: "Classic Cheeseburger",
        description: "Juicy beef patty with cheddar cheese, lettuce, tomato, and pickles.",
        nutrition: {
          calories: 700,
          protein: 45,
          carbs: 50,
          fat: 40,
        },
        price: 9.99,
        category: "Fast Food",
        isVegan: false,
        isGlutenFree: false,
        allergens: ["Gluten", "Dairy"],
      },
      {
        name: "Gluten-Free Margherita Pizza",
        description: "A delicious gluten-free pizza topped with fresh basil and mozzarella.",
        nutrition: {
          calories: 600,
          protein: 25,
          carbs: 65,
          fat: 20,
        },
        price: 12.99,
        category: "Pizza",
        isVegan: false,
        isGlutenFree: true,
        allergens: ["Dairy"],
      },
      {
        name: "Tofu Stir-Fry",
        description: "Stir-fried tofu with vegetables and soy-ginger sauce.",
        nutrition: {
          calories: 400,
          protein: 30,
          carbs: 45,
          fat: 12,
        },
        price: 9.49,
        category: "Asian",
        isVegan: true,
        isGlutenFree: false,
        allergens: ["Soy"],
      },
    ],
  });

  console.log("Meals seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
