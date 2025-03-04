import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // First, create buses
  const buses = await prisma.bus.createMany({
    data: [
      {
        busNumber: "B001",
        capacity: 45,
        description: "Express Bus - Air Conditioned",
      },
      {
        busNumber: "B002",
        capacity: 40,
        description: "Regular Bus - Air Conditioned",
      },
      {
        busNumber: "B003",
        capacity: 35,
        description: "Mini Bus - Air Conditioned",
      },
    ],
  });

  console.log("Buses seeded successfully!");

  // Get the created buses for reference
  const createdBuses = await prisma.bus.findMany();

  // Create routes for each bus
  for (const bus of createdBuses) {
    const route = await prisma.busRoute.create({
      data: {
        busId: bus.id,
        routeName: `Route ${bus.busNumber}`,
        startPoint: "University Main Gate",
        endPoint: "City Center",
        distance: 15.5,
        duration: 45, // minutes
        fare: 2.50,
      },
    });

    // Create stops for each route
    await prisma.busStop.createMany({
      data: [
        {
          stopName: "University Main Gate",
          sequence: 1,
          routeId: route.id,
          latitude: 23.7461,
          longitude: 90.3742,
        },
        {
          stopName: "Library Stop",
          sequence: 2,
          routeId: route.id,
          latitude: 23.7464,
          longitude: 90.3745,
        },
        {
          stopName: "Student Center",
          sequence: 3,
          routeId: route.id,
          latitude: 23.7468,
          longitude: 90.3749,
        },
        {
          stopName: "City Center",
          sequence: 4,
          routeId: route.id,
          latitude: 23.7472,
          longitude: 90.3753,
        },
      ],
    });

    // Create schedules for each route
    const currentDate = new Date();
    const schedules = [
      {
        departureTime: new Date(currentDate.setHours(8, 0, 0, 0)),
        arrivalTime: new Date(currentDate.setHours(8, 45, 0, 0)),
      },
      {
        departureTime: new Date(currentDate.setHours(12, 0, 0, 0)),
        arrivalTime: new Date(currentDate.setHours(12, 45, 0, 0)),
      },
      {
        departureTime: new Date(currentDate.setHours(16, 0, 0, 0)),
        arrivalTime: new Date(currentDate.setHours(16, 45, 0, 0)),
      },
    ];

    await prisma.busSchedule.createMany({
      data: schedules.map(schedule => ({
        busId: bus.id,
        routeId: route.id,
        departureTime: schedule.departureTime,
        arrivalTime: schedule.arrivalTime,
      })),
    });
  }

  console.log("Bus routes, stops, and schedules seeded successfully!");

  // Your existing meal seeding code can remain here
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
