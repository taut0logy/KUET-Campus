import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function cleanDatabase() {
  await prisma.reminder.deleteMany({});
  await prisma.maintenanceLog.deleteMany({});
  await prisma.busSchedule.deleteMany({});
  await prisma.busStop.deleteMany({});
  await prisma.busRoute.deleteMany({});
  await prisma.driver.deleteMany({});
  await prisma.bus.deleteMany({});
  await prisma.meal.deleteMany({});
  
  console.log("Database cleaned successfully!");
}

async function seedBusRoutes() {
  await cleanDatabase();

  // Create 12 buses
  const buses = await prisma.bus.createMany({
    data: [
      {
        busNumber: "B001",
        licensePlate: "LP-B001",
        capacity: 45,
        type: "SHUTTLE",
        description: "Express Bus - Air Conditioned",
        isActive: true,
      },
      {
        busNumber: "B002",
        licensePlate: "LP-B002",
        capacity: 40,
        type: "MINIBUS",
        description: "Regular Bus - Air Conditioned",
        isActive: true,
      },
      {
        busNumber: "B003",
        licensePlate: "LP-B003",
        capacity: 35,
        type: "MINIBUS",
        description: "Mini Bus - Air Conditioned",
        isActive: true,
      },
      {
        busNumber: "B004",
        licensePlate: "LP-B004",
        capacity: 50,
        type: "ARTICULATED",
        description: "Large Capacity Bus",
        isActive: true,
      },
      {
        busNumber: "B005",
        licensePlate: "LP-B005",
        capacity: 45,
        type: "SHUTTLE",
        description: "Express Bus - Standard",
        isActive: true,
      },
      {
        busNumber: "B006",
        licensePlate: "LP-B006",
        capacity: 40,
        type: "MINIBUS",
        description: "Campus Shuttle",
        isActive: true,
      },
      {
        busNumber: "B007",
        licensePlate: "LP-B007",
        capacity: 55,
        type: "ARTICULATED",
        description: "Double Length Bus",
        isActive: true,
      },
      {
        busNumber: "B008",
        licensePlate: "LP-B008",
        capacity: 45,
        type: "SHUTTLE",
        description: "Express Bus - Premium",
        isActive: true,
      },
      {
        busNumber: "B009",
        licensePlate: "LP-B009",
        capacity: 35,
        type: "MINIBUS",
        description: "Compact Shuttle",
        isActive: true,
      },
      {
        busNumber: "B010",
        licensePlate: "LP-B010",
        capacity: 50,
        type: "SHUTTLE",
        description: "Long Distance Bus",
        isActive: true,
      },
      {
        busNumber: "B011",
        licensePlate: "LP-B011",
        capacity: 45,
        type: "MINIBUS",
        description: "City Connector",
        isActive: true,
      },
      {
        busNumber: "B012",
        licensePlate: "LP-B012",
        capacity: 40,
        type: "SHUTTLE",
        description: "Campus Express",
        isActive: false,
      },
    ],
  });

  console.log("Buses seeded successfully!");

  // Create 12 drivers
  const drivers = await prisma.driver.createMany({
    data: [
      {
        firstName: "John",
        lastName: "Doe",
        licenseNumber: "DL001",
        phone: "1234567890",
        isAvailable: true,
      },
      {
        firstName: "Jane",
        lastName: "Smith",
        licenseNumber: "DL002",
        phone: "0987654321",
        isAvailable: true,
      },
      {
        firstName: "Michael",
        lastName: "Johnson",
        licenseNumber: "DL003",
        phone: "5551234567",
        isAvailable: true,
      },
      {
        firstName: "Sarah",
        lastName: "Williams",
        licenseNumber: "DL004",
        phone: "5559876543",
        isAvailable: true,
      },
      {
        firstName: "Robert",
        lastName: "Brown",
        licenseNumber: "DL005",
        phone: "5552345678",
        isAvailable: true,
      },
      {
        firstName: "Emily",
        lastName: "Davis",
        licenseNumber: "DL006",
        phone: "5558765432",
        isAvailable: true,
      },
      {
        firstName: "William",
        lastName: "Miller",
        licenseNumber: "DL007",
        phone: "5553456789",
        isAvailable: true,
      },
      {
        firstName: "Elizabeth",
        lastName: "Wilson",
        licenseNumber: "DL008",
        phone: "5557654321",
        isAvailable: false,
      },
      {
        firstName: "David",
        lastName: "Moore",
        licenseNumber: "DL009",
        phone: "5554567890",
        isAvailable: true,
      },
      {
        firstName: "Jennifer",
        lastName: "Taylor",
        licenseNumber: "DL010",
        phone: "5556543210",
        isAvailable: true,
      },
      {
        firstName: "Richard",
        lastName: "Anderson",
        licenseNumber: "DL011",
        phone: "5555678901",
        isAvailable: true,
      },
      {
        firstName: "Patricia",
        lastName: "Thomas",
        licenseNumber: "DL012",
        phone: "5555432109",
        isAvailable: false,
      },
    ],
  });

  console.log("Drivers seeded successfully!");

  // Get the created buses and drivers for reference
  const createdBuses = await prisma.bus.findMany();
  const createdDrivers = await prisma.driver.findMany();

  // Create routes and related data for each bus
  for (const bus of createdBuses) {
    const routeDirections = ["CLOCKWISE", "COUNTER_CLOCKWISE"];
    const routeDirection = routeDirections[Math.floor(Math.random() * routeDirections.length)];

    const route = await prisma.busRoute.create({
      data: {
        routeName: `Route ${bus.busNumber}`,
        routeCode: `RT-${bus.busNumber}`,
        startPoint: "University Main Gate",
        endPoint: "City Center",
        distance: 15.5 + Math.random() * 10,
        duration: 45 + Math.floor(Math.random() * 30),
        direction: routeDirection,
        isActive: true,
        busId: bus.id,
      },
    });

    // Create stops for each route
    const stops = [
      {
        stopName: "University Main Gate",
        sequence: 1,
        timeFromStart: 0,
        campusZone: "Main Campus",
      },
      {
        stopName: "Library Complex",
        sequence: 2,
        timeFromStart: 5,
        campusZone: "Academic Zone",
      },
      {
        stopName: "Student Center",
        sequence: 3,
        timeFromStart: 10,
        campusZone: "Student Zone",
      },
      {
        stopName: "Sports Complex",
        sequence: 4,
        timeFromStart: 15,
        campusZone: "Sports Zone",
      },
      {
        stopName: "Engineering Building",
        sequence: 5,
        timeFromStart: 20,
        campusZone: "Academic Zone",
      },
      {
        stopName: "Science Complex",
        sequence: 6,
        timeFromStart: 25,
        campusZone: "Research Zone",
      },
      {
        stopName: "Medical Center",
        sequence: 7,
        timeFromStart: 30,
        campusZone: "Medical Zone",
      },
      {
        stopName: "Residential Halls",
        sequence: 8,
        timeFromStart: 35,
        campusZone: "Residential Zone",
      },
      {
        stopName: "Shopping Center",
        sequence: 9,
        timeFromStart: 40,
        campusZone: "Commercial Zone",
      },
      {
        stopName: "City Center",
        sequence: 10,
        timeFromStart: 45,
        campusZone: "City Zone",
      },
    ];

    await prisma.busStop.createMany({
      data: stops.map((stop, index) => ({
        ...stop,
        routeId: route.id,
        latitude: 23.7461 + (index * 0.0003),
        longitude: 90.3742 + (index * 0.0003),
      })),
    });

    // Create multiple schedules for each route
    const schedules = [
      { departureTime: "07:00", arrivalTime: "07:45" },
      { departureTime: "08:00", arrivalTime: "08:45" },
      { departureTime: "09:00", arrivalTime: "09:45" },
      { departureTime: "10:00", arrivalTime: "10:45" },
      { departureTime: "11:00", arrivalTime: "11:45" },
      { departureTime: "12:00", arrivalTime: "12:45" },
      { departureTime: "13:00", arrivalTime: "13:45" },
      { departureTime: "14:00", arrivalTime: "14:45" },
      { departureTime: "15:00", arrivalTime: "15:45" },
      { departureTime: "16:00", arrivalTime: "16:45" },
    ];

    await prisma.busSchedule.createMany({
      data: schedules.map((schedule, index) => ({
        busId: bus.id,
        routeId: route.id,
        driverId: createdDrivers[index % createdDrivers.length].id,
        departureTime: schedule.departureTime,
        arrivalTime: schedule.arrivalTime,
        bookedSeats: Math.floor(Math.random() * 10),
        totalCapacity: bus.capacity,
        availableSeats: bus.capacity - Math.floor(Math.random() * 10),
        isRecurring: true,
        frequency: "DAILY",
        status: "SCHEDULED",
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      })),
    });

    // Create maintenance logs
    const maintenanceTypes = ["ROUTINE", "REPAIR", "INSPECTION"];
    await Promise.all(
      Array(10).fill(null).map(async (_, index) => {
        const maintenanceType = maintenanceTypes[index % maintenanceTypes.length];
        const date = new Date();
        date.setDate(date.getDate() - (index * 30)); // One entry per month

        return prisma.maintenanceLog.create({
          data: {
            busId: bus.id,
            maintenanceDate: date,
            type: maintenanceType,
            description: `${maintenanceType.toLowerCase()} maintenance - ${index + 1}`,
            cost: 150.00 + (index * 50),
            nextDueDate: new Date(date.getTime() + 30 * 24 * 60 * 60 * 1000),
          },
        });
      })
    );
  }

  console.log("Bus routes, stops, schedules, and maintenance logs seeded successfully!");

  console.log("Meals seeded successfully!");
}

seedBusRoutes()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
