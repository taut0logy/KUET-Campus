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
      {
        name: "Salmon Fillet",
        description: "A delicious salmon fillet with a side of vegetables.",
        nutrition: {
          calories: 400,
          protein: 20,
          carbs: 10,
          fat: 15,
        },
        price: 14.99,
        category: "Seafood",
        isVegan: false,
        isGlutenFree: true,
        allergens: ["Fish"],
      },

      {
        name: "Beef Tacos",
        description: "Seasoned beef served in soft tortillas with lettuce, cheese, and salsa.",
        nutrition: {
          calories: 500,
          protein: 25,
          carbs: 50,
          fat: 20,
        },
        price: 8.99,
        category: "Mexican",
        isVegan: false,
        isGlutenFree: false,
        allergens: ["Gluten", "Dairy"],
      },

      {
        name: "Vegetable Stir-Fry",
        description: "A healthy stir-fry with a variety of vegetables and a light sauce.",
        nutrition: {
          calories: 400,
          protein: 20,
          carbs: 40,
          fat: 15,
        },
        price: 9.99,
        category: "Asian",
        isVegan: true,
        isGlutenFree: false,
        allergens: ["Soy"],
      },

      {
        name: "Vegetable Curry",
        description: "A spicy blend of vegetables simmered in a rich curry sauce.",
        nutrition: {
          calories: 450,
          protein: 10,
          carbs: 60,
          fat: 18,
        },
        price: 9.99,
        category: "Indian",
        isVegan: true,
        isGlutenFree: true,
        allergens: ["None"],
      },
      {
        name: "Shrimp Scampi",
        description: "Succulent shrimp sautéed in garlic butter sauce, served over pasta.",
        nutrition: {
          calories: 650,
          protein: 35,
          carbs: 70,
          fat: 25,
        },
        price: 13.99,
        category: "Seafood",
        isVegan: false,
        isGlutenFree: false,
        allergens: ["Shellfish", "Gluten"],
      },
      {
        name: "Mushroom Risotto",
        description: "Creamy risotto with mushrooms and Parmesan cheese.",
        nutrition: {
          calories: 550,
          protein: 20,
          carbs: 60,
          fat: 22,
        },
        price: 11.99,
        category: "Italian",
        isVegan: true,
        isGlutenFree: false,
        allergens: ["Dairy"],
      },
      {
        name: "Pasta Carbonara",
        description: "Creamy pasta with bacon, eggs, and Parmesan cheese.",
        nutrition: {
          calories: 600,
          protein: 25,
          carbs: 70,
          fat: 28,
        },
        price: 12.99,
        category: "Italian",
        isVegan: false,
        isGlutenFree: false,
        allergens: ["Gluten", "Dairy"],
      },
      {
        name: "Eggplant Parmesan",
        description: "Breaded eggplant slices baked with marinara sauce and mozzarella.",
        nutrition: {
          calories: 550,
          protein: 20,
          carbs: 60,
          fat: 25,
        },
        price: 11.49,
        category: "Italian",
        isVegan: false,
        isGlutenFree: false,
        allergens: ["Gluten", "Dairy"],
      },
      {
        name: "Chicken Caesar Wrap",
        description: "Grilled chicken, romaine lettuce, parmesan, and Caesar dressing in a wrap.",
        nutrition: {
          calories: 600,
          protein: 35,
          carbs: 50,
          fat: 25,
        },
        price: 8.49,
        category: "Sandwich",
        isVegan: false,
        isGlutenFree: false,
        allergens: ["Gluten", "Dairy", "Fish"],
      },
      {
        name: "Mushroom Risotto",
        description: "Creamy arborio rice cooked with mushrooms and parmesan cheese.",
        nutrition: {
          calories: 500,
          protein: 15,
          carbs: 70,
          fat: 18,
        },
        price: 12.49,
        category: "Italian",
        isVegan: false,
        isGlutenFree: true,
        allergens: ["Dairy"], 
      },
      {
        name: "Vegetable Lasagna",
        description: "Layers of pasta, ricotta cheese, spinach, and marinara sauce.",
        nutrition: {
          calories: 550,
          protein: 15,
          carbs: 70,
          fat: 18,
        },
        price: 12.49,
        category: "Italian",
        isVegan: false,
        isGlutenFree: false,
        allergens: ["Gluten", "Dairy"],
      },
      {
        name: "Falafel Plate",
        description: "Crispy falafel served with hummus, pita bread, and a side salad.",
        nutrition: {
          calories: 550,
          protein: 20,
          carbs: 70,
          fat: 20,
        },
        price: 10.49,
        category: "Middle Eastern",
        isVegan: true,
        isGlutenFree: false,
        allergens: ["Gluten", "Sesame"],
      },

      {
        name: "Lentil Soup",  
        description: "A hearty lentil soup with vegetables and a side of bread.",
        nutrition: {
          calories: 450,
          protein: 15,
          carbs: 70,
          fat: 18,
        },
        price: 8.49,
        category: "Soup",
        isVegan: true,
        isGlutenFree: true,
        allergens: ["None"],
      },  
      {
        name: "Mashed Potatoes",  
        description: "Creamy mashed potatoes with butter and milk.",
        nutrition: {
          calories: 200,
          protein: 5,
          carbs: 40,
          fat: 10,
        },
        price: 4.99,
        category: "Side",
        isVegan: true,
        isGlutenFree: true,
        allergens: ["None"],
      },
      {
        name: "Garlic Bread",
        description: "Garlic bread with melted cheese.",
        nutrition: {
          calories: 200,
          protein: 5,
          carbs: 40,
          fat: 10,
        },
        price: 4.99,
        category: "Side",
        isVegan: true,
        isGlutenFree: true,
        allergens: ["None"],
      }

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
