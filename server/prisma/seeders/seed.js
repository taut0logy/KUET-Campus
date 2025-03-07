import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();

async function seedDepartments() {
  const departments = [
    { name: 'Department of Civil Engineering', alias: 'CE', faculty: 'Faculty of Civil Engineering' },
    { name: 'Department of Urban and Regional Planning', alias: 'URP', faculty: 'Faculty of Civil Engineering' },
    { name: 'Department of Building Engineering and Construction Management', alias: 'BECM', faculty: 'Faculty of Civil Engineering' },
    { name: 'Department of Architecture', alias: 'ARCH', faculty: 'Faculty of Civil Engineering' },
    { name: 'Department of Mathematics', alias: 'MATH', faculty: 'Faculty of Science and Humanities' },
    { name: 'Department of Physics', alias: 'PHY', faculty: 'Faculty of Science and Humanities' },
    { name: 'Department of Chemistry', alias: 'CHEM', faculty: 'Faculty of Science and Humanities' },
    { name: 'Department of Humanities and Business', alias: 'HUM', faculty: 'Faculty of Science and Humanities' },
    { name: 'Department of Electrical and Electronic Engineering', alias: 'EEE', faculty: 'Faculty of Electrical and Electronic Engineering' },
    { name: 'Department of Computer Science and Engineering', alias: 'CSE', faculty: 'Faculty of Electrical and Electronic Engineering' },
    { name: 'Department of Electronics and Communication Engineering', alias: 'ECE', faculty: 'Faculty of Electrical and Electronic Engineering' },
    { name: 'Department of Biomedical Engineering', alias: 'BME', faculty: 'Faculty of Electrical and Electronic Engineering' },
    { name: 'Department of Materials Science and Engineering', alias: 'MSE', faculty: 'Faculty of Electrical and Electronic Engineering' },
    { name: 'Department of Mechanical Engineering', alias: 'ME', faculty: 'Faculty of Mechanical Engineering' },
    { name: 'Department of Industrial Engineering and Management', alias: 'IEM', faculty: 'Faculty of Mechanical Engineering' },
    { name: 'Department of Energy Science and Engineering', alias: 'ESE', faculty: 'Faculty of Mechanical Engineering' },
    { name: 'Department of Leather Engineering', alias: 'LE', faculty: 'Faculty of Mechanical Engineering' },
    { name: 'Department of Textile Engineering', alias: 'TE', faculty: 'Faculty of Mechanical Engineering' },
    { name: 'Department of Chemical Engineering', alias: 'CHE', faculty: 'Faculty of Mechanical Engineering' },
    { name: 'Department of Mechatronics Engineering', alias: 'MTE', faculty: 'Faculty of Mechanical Engineering' }
  ];

  for (const department of departments) {
    await prisma.department.create({ data: department });
  }

  console.log('Departments seeded successfully!');
}

async function main() {
  // Clear existing meals
  await prisma.meal.deleteMany({});
  await prisma.department.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.club.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.userClubManager.deleteMany({});
  await prisma.studentInfo.deleteMany({});
  await prisma.facultyInfo.deleteMany({});
  await prisma.employeeInfo.deleteMany({});
  await prisma.user.deleteMany({});
  

  await seedDepartments();


  console.log("Cleared existing meals");

  // Create new meals with updated schema
  await prisma.meal.createMany({
    data: [
      {
        name: "Grilled Chicken Salad",
        description: "A healthy mix of grilled chicken, fresh greens, and vinaigrette dressing.",
        price: 8.99,
        category: "Salad",
        isVegan: false,
        isGlutenFree: true,
        isSugarFree: true,
        isLowFat: true,
        isOrganic: false,
        calories: 350,
        protein: 40,
        carbs: 15,
        fat: 10,
        fiber: 5,
        sugar: 3,
        sodium: 320,
        vitaminA: 2500,
        vitaminC: 30,
        calcium: 120,
        iron: 2,
        allergens: ["None"]
      },
      {
        name: "Vegan Buddha Bowl",
        description: "A balanced bowl with quinoa, chickpeas, avocado, and tahini dressing.",
        price: 10.99,
        category: "Vegan",
        isVegan: true,
        isGlutenFree: true,
        isSugarFree: true,
        isLowFat: false,
        isOrganic: true,
        calories: 500,
        protein: 20,
        carbs: 55,
        fat: 15,
        fiber: 12,
        sugar: 6,
        sodium: 240,
        vitaminA: 4000,
        vitaminC: 45,
        calcium: 150,
        iron: 6,
        allergens: ["Sesame"]
      },
      {
        name: "Classic Cheeseburger",
        description: "Juicy beef patty with cheddar cheese, lettuce, tomato, and pickles.",
        price: 9.99,
        category: "Fast Food",
        isVegan: false,
        isGlutenFree: false,
        isSugarFree: false,
        isLowFat: false,
        isOrganic: false,
        calories: 700,
        protein: 45,
        carbs: 50,
        fat: 40,
        fiber: 3,
        sugar: 8,
        sodium: 980,
        vitaminA: 600,
        vitaminC: 10,
        calcium: 300,
        iron: 4,
        allergens: ["Gluten", "Dairy"]
      },
      {
        name: "Whole Grain Breakfast Bowl",
        description: "Nutritious bowl with oats, fresh fruits, nuts and honey.",
        price: 7.99,
        category: "Breakfast",
        isVegan: false,
        isGlutenFree: false,
        isSugarFree: false,
        isLowFat: true,
        isOrganic: true,
        calories: 450,
        protein: 15,
        carbs: 75,
        fat: 12,
        fiber: 8,
        sugar: 22,
        sodium: 120,
        vitaminA: 800,
        vitaminC: 20,
        calcium: 200,
        iron: 3,
        allergens: ["Nuts", "Gluten"]
      },
      {
        name: "Tofu Stir-Fry",
        description: "Stir-fried tofu with vegetables and soy-ginger sauce.",
        price: 9.49,
        category: "Asian",
        isVegan: true,
        isGlutenFree: false,
        isSugarFree: false,
        isLowFat: true,
        isOrganic: false,
        calories: 400,
        protein: 30,
        carbs: 45,
        fat: 12,
        fiber: 6,
        sugar: 10,
        sodium: 750,
        vitaminA: 3000,
        vitaminC: 40,
        calcium: 250,
        iron: 8,
        allergens: ["Soy", "Gluten"]
      },
      {
        name: "Wild Salmon Fillet",
        description: "Grilled wild-caught salmon with roasted vegetables and herbed quinoa.",
        price: 16.99,
        category: "Seafood",
        isVegan: false,
        isGlutenFree: true,
        isSugarFree: true,
        isLowFat: false,
        isOrganic: false,
        calories: 520,
        protein: 42,
        carbs: 25,
        fat: 28,
        fiber: 5,
        sugar: 3,
        sodium: 340,
        vitaminA: 900,
        vitaminC: 25,
        calcium: 180,
        iron: 3,
        allergens: ["Fish"]
      },
      {
        name: "Mediterranean Wrap",
        description: "Whole grain wrap filled with hummus, falafel, fresh vegetables and tzatziki.",
        price: 8.49,
        category: "Sandwich",
        isVegan: false, // Contains tzatziki
        isGlutenFree: false,
        isSugarFree: true,
        isLowFat: true,
        isOrganic: true,
        calories: 480,
        protein: 18,
        carbs: 60,
        fat: 20,
        fiber: 9,
        sugar: 5,
        sodium: 600,
        vitaminA: 1500,
        vitaminC: 35,
        calcium: 150,
        iron: 4,
        allergens: ["Gluten", "Sesame"]
      },
      {
        name: "Vegetable Curry",
        description: "A spicy blend of vegetables simmered in a rich curry sauce.",
        price: 9.99,
        category: "Indian",
        isVegan: true,
        isGlutenFree: true,
        isSugarFree: false,
        isLowFat: true,
        isOrganic: false,
        calories: 450,
        protein: 10,
        carbs: 60,
        fat: 18,
        fiber: 8,
        sugar: 7,
        sodium: 680,
        vitaminA: 4500,
        vitaminC: 38,
        calcium: 120,
        iron: 5,
        allergens: ["None"]
      },
      {
        name: "Shrimp Scampi",
        description: "Succulent shrimp sautéed in garlic butter sauce, served over pasta.",
        price: 13.99,
        category: "Seafood",
        isVegan: false,
        isGlutenFree: false,
        isSugarFree: true,
        isLowFat: false,
        isOrganic: false,
        calories: 650,
        protein: 35,
        carbs: 70,
        fat: 25,
        fiber: 3,
        sugar: 4,
        sodium: 890,
        vitaminA: 600,
        vitaminC: 12,
        calcium: 100,
        iron: 3,
        allergens: ["Shellfish", "Gluten", "Dairy"]
      },
      {
        name: "Quinoa Power Bowl",
        description: "Protein-rich quinoa with roasted vegetables, avocado, and tahini dressing.",
        price: 11.99,
        category: "Vegan",
        isVegan: true,
        isGlutenFree: true,
        isSugarFree: true,
        isLowFat: true,
        isOrganic: true,
        calories: 480,
        protein: 18,
        carbs: 65,
        fat: 16,
        fiber: 10,
        sugar: 5,
        sodium: 320,
        vitaminA: 3800,
        vitaminC: 40,
        calcium: 160,
        iron: 6,
        allergens: ["Sesame"]
      },
      {
        name: "Keto Plate",
        description: "High-fat, low-carb meal with grilled steak, avocado, and greens.",
        price: 14.99,
        category: "Specialty Diet",
        isVegan: false,
        isGlutenFree: true,
        isSugarFree: true,
        isLowFat: false,
        isOrganic: false,
        calories: 650,
        protein: 40,
        carbs: 8,
        fat: 52,
        fiber: 5,
        sugar: 2,
        sodium: 580,
        vitaminA: 1500,
        vitaminC: 15,
        calcium: 120,
        iron: 5,
        allergens: ["None"]
      },
      {
        name: "Berry Smoothie Bowl",
        description: "Blend of mixed berries, banana, and almond milk topped with granola and seeds.",
        price: 8.49,
        category: "Breakfast",
        isVegan: true,
        isGlutenFree: false,
        isSugarFree: false,
        isLowFat: true,
        isOrganic: true,
        calories: 380,
        protein: 10,
        carbs: 65,
        fat: 8,
        fiber: 9,
        sugar: 35,
        sodium: 90,
        vitaminA: 800,
        vitaminC: 60,
        calcium: 180,
        iron: 3,
        allergens: ["Nuts", "Gluten"]
      },
      {
        name: "Chicken Tikka Masala",
        description: "Tender chicken in a creamy, spiced tomato sauce with basmati rice.",
        price: 12.99,
        category: "Indian",
        isVegan: false,
        isGlutenFree: true,
        isSugarFree: false,
        isLowFat: false,
        isOrganic: false,
        calories: 620,
        protein: 38,
        carbs: 50,
        fat: 32,
        fiber: 4,
        sugar: 8,
        sodium: 850,
        vitaminA: 1200,
        vitaminC: 20,
        calcium: 150,
        iron: 4,
        allergens: ["Dairy"]
      },
      {
        name: "Avocado Toast",
        description: "Multigrain toast topped with smashed avocado, cherry tomatoes, and microgreens.",
        price: 7.99,
        category: "Breakfast",
        isVegan: true,
        isGlutenFree: false,
        isSugarFree: true,
        isLowFat: false,
        isOrganic: true,
        calories: 320,
        protein: 8,
        carbs: 35,
        fat: 18,
        fiber: 8,
        sugar: 3,
        sodium: 380,
        vitaminA: 1000,
        vitaminC: 15,
        calcium: 60,
        iron: 2,
        allergens: ["Gluten"]
      },
      {
        name: "Beef Teriyaki Bowl",
        description: "Tender slices of beef in teriyaki sauce with steamed rice and vegetables.",
        price: 11.99,
        category: "Asian",
        isVegan: false,
        isGlutenFree: false,
        isSugarFree: false,
        isLowFat: false,
        isOrganic: false,
        calories: 580,
        protein: 35,
        carbs: 70,
        fat: 18,
        fiber: 4,
        sugar: 18,
        sodium: 950,
        vitaminA: 900,
        vitaminC: 25,
        calcium: 80,
        iron: 4,
        allergens: ["Soy", "Gluten"]
      },
      {
        name: "Spinach and Feta Omelette",
        description: "Fluffy three-egg omelette with spinach, feta cheese, and herbs.",
        price: 8.99,
        category: "Breakfast",
        isVegan: false,
        isGlutenFree: true,
        isSugarFree: true,
        isLowFat: false,
        isOrganic: false,
        calories: 380,
        protein: 25,
        carbs: 5,
        fat: 28,
        fiber: 2,
        sugar: 1,
        sodium: 620,
        vitaminA: 3500,
        vitaminC: 10,
        calcium: 320,
        iron: 4,
        allergens: ["Eggs", "Dairy"]
      },
      {
        name: "Sweet Potato Fries",
        description: "Crispy baked sweet potato fries with chipotle aioli.",
        price: 4.99,
        category: "Side",
        isVegan: false, // Aioli contains eggs
        isGlutenFree: true,
        isSugarFree: false,
        isLowFat: false,
        isOrganic: true,
        calories: 320,
        protein: 3,
        carbs: 40,
        fat: 18,
        fiber: 6,
        sugar: 8,
        sodium: 380,
        vitaminA: 12000,
        vitaminC: 30,
        calcium: 40,
        iron: 1,
        allergens: ["Eggs"]
      },
      {
        name: "Fresh Fruit Platter",
        description: "Assortment of seasonal fruits beautifully arranged.",
        price: 7.49,
        category: "Side",
        isVegan: true,
        isGlutenFree: true,
        isSugarFree: false,
        isLowFat: true,
        isOrganic: true,
        calories: 150,
        protein: 2,
        carbs: 38,
        fat: 0,
        fiber: 6,
        sugar: 30,
        sodium: 5,
        vitaminA: 1500,
        vitaminC: 90,
        calcium: 40,
        iron: 1,
        allergens: ["None"]
      },
      {
        name: "Steamed Brown Rice",
        description: "Perfectly cooked whole grain brown rice.",
        price: 3.49,
        category: "Side",
        isVegan: true,
        isGlutenFree: true,
        isSugarFree: true,
        isLowFat: true,
        isOrganic: true,
        calories: 220,
        protein: 5,
        carbs: 45,
        fat: 2,
        fiber: 3,
        sugar: 0,
        sodium: 10,
        vitaminA: 0,
        vitaminC: 0,
        calcium: 20,
        iron: 1,
        allergens: ["None"]
      }
    ],

    
  });

  const csDepartment = await prisma.department.create({
    data: {
      name: 'Computer Science',
      alias: 'CS',
      faculty: 'Engineering'
    }
  });

  // Create faculty users (club moderators)
  const facultyUserSGIPC = await prisma.user.create({
    data: {
      email: 'faculty.sgipc@example.com',
      password: 'password', // use proper hashing in production
      name: 'Dr. SGIPC Moderator',
      roles: ['FACULTY'],
      status: 'ACTIVE',
      emailVerified: true,
      facultyInfo: {
        create: {
          employeeId: 'F100',
          status: 'PERMANENT',
          designation: 'ASSISTANT_PROFESSOR',
          departmentId: csDepartment.id
        }
      }
    }
  });

  const facultyUserBit2byte = await prisma.user.create({
    data: {
      email: 'faculty.bit2byte@example.com',
      password: 'password',
      name: 'Dr. Bit2byte Moderator',
      roles: ['FACULTY'],
      status: 'ACTIVE',
      emailVerified: true,
      facultyInfo: {
        create: {
          employeeId: 'F101',
          status: 'PERMANENT',
          designation: 'ASSOCIATE_PROFESSOR',
          departmentId: csDepartment.id
        }
      }
    }
  });

  const facultyUserHACK = await prisma.user.create({
    data: {
      email: 'faculty.hack@example.com',
      password: 'password',
      name: 'Dr. HACK Moderator',
      roles: ['FACULTY'],
      status: 'ACTIVE',
      emailVerified: true,
      facultyInfo: {
        create: {
          employeeId: 'F102',
          status: 'PERMANENT',
          designation: 'PROFESSOR',
          departmentId: csDepartment.id
        }
      }
    }
  });

  // Create student users (to be assigned as club managers)
  const student1 = await prisma.user.create({
    data: {
      email: 'student1@example.com',
      password: 'password',
      name: 'Student One',
      roles: ['STUDENT'],
      status: 'ACTIVE',
      emailVerified: true,
      studentInfo: {
        create: {
          studentId: 'S001',
          section: 'A',
          batch: 2023,
          departmentId: csDepartment.id
        }
      }
    }
  });

  const student2 = await prisma.user.create({
    data: {
      email: 'student2@example.com',
      password: 'password',
      name: 'Student Two',
      roles: ['STUDENT'],
      status: 'ACTIVE',
      emailVerified: true,
      studentInfo: {
        create: {
          studentId: 'S002',
          section: 'B',
          batch: 2023,
          departmentId: csDepartment.id
        }
      }
    }
  });

  // Create an employee user (example: Office Manager)
  const employeeUser = await prisma.user.create({
    data: {
      email: 'employee@example.com',
      password: 'password',
      name: 'Employee User',
      roles: ['OFFICE_MANAGER'],
      status: 'ACTIVE',
      emailVerified: true,
      employeeInfo: {
        create: {
          employeeId: 'E001',
          designation: 'Office Manager'
        }
      }
    }
  });

  // Create Clubs
  const clubSGIPC = await prisma.club.create({
    data: {
      name: 'SGIPC',
      coverPhoto: 'https://example.com/sgipc.jpg',
      slug: 'sgipc',
      description: 'A club focused on programming contests.',
      foundingDate: new Date('2020-01-01'),
      moderatorId: facultyUserSGIPC.id,
      tags: JSON.stringify(['programming', 'contests']),
    }
  });

  const clubBit2byte = await prisma.club.create({
    data: {
      name: 'Bit2byte',
      coverPhoto: 'https://example.com/bit2byte.jpg',
      slug: 'bit2byte',
      description: 'A club focused on software development and hackathons.',
      foundingDate: new Date('2021-06-15'),
      moderatorId: facultyUserBit2byte.id,
      tags: JSON.stringify(['software', 'hackathons']),
    }
  });

  const clubHACK = await prisma.club.create({
    data: {
      name: 'HACK',
      coverPhoto: 'https://example.com/hack.jpg',
      slug: 'hack',
      description: 'A club interested in hardware and embedded programming.',
      foundingDate: new Date('2019-09-10'),
      moderatorId: facultyUserHACK.id,
      tags: JSON.stringify(['hardware', 'embedded']),
    }
  });

  // Create club manager assignments (using UserClubManager)
  await prisma.userClubManager.create({
    data: {
      userId: student1.id,
      clubId: clubSGIPC.id,
      role: 'MANAGER'
    }
  });

  await prisma.userClubManager.create({
    data: {
      userId: student2.id,
      clubId: clubBit2byte.id,
      role: 'MANAGER'
    }
  });

  // Also assign a manager to HACK for diversity
  await prisma.userClubManager.create({
    data: {
      userId: student1.id,
      clubId: clubHACK.id,
      role: 'MANAGER'
    }
  });

  // Create Events for each Club
  const eventSGIPC = await prisma.event.create({
    data: {
      name: 'SGIPC Annual Programming Contest',
      coverPhoto: 'https://example.com/sgipc-event.jpg',
      slug: 'sgipc-annual-programming-contest',
      description: 'Join us for our annual programming contest to test your coding skills!',
      startTime: new Date('2023-11-15T09:00:00Z'),
      endTime: new Date('2023-11-15T17:00:00Z'),
      eventLinks: JSON.stringify([{ name: 'Register', url: 'https://sgipc.com/register' }]),
      clubId: clubSGIPC.id,
    }
  });

  const eventBit2byte = await prisma.event.create({
    data: {
      name: 'Bit2byte Hackathon 2023',
      coverPhoto: 'https://example.com/bit2byte-event.jpg',
      slug: 'bit2byte-hackathon-2023',
      description: 'A 24-hour hackathon focusing on innovative software solutions.',
      startTime: new Date('2023-12-01T08:00:00Z'),
      endTime: new Date('2023-12-02T08:00:00Z'),
      eventLinks: JSON.stringify([{ name: 'Learn More', url: 'https://bit2byte.com/hackathon' }]),
      clubId: clubBit2byte.id,
    }
  });

  const eventHACK = await prisma.event.create({
    data: {
      name: 'HACK Embedded Systems Workshop',
      coverPhoto: 'https://example.com/hack-event.jpg',
      slug: 'hack-embedded-systems-workshop',
      description: 'A hands-on workshop exploring hardware programming and embedded systems.',
      startTime: new Date('2023-10-05T10:00:00Z'),
      endTime: new Date('2023-10-05T16:00:00Z'),
      eventLinks: JSON.stringify([{ name: 'Sign Up', url: 'https://hack.com/workshop' }]),
      clubId: clubHACK.id,
    }
  });

  console.log('Seeding finished.');

  console.log("New meals seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
