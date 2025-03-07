// prisma/seed.js

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Seed Users
  const user1 = await prisma.user.create({
    data: {
      email: 'student@example.com',
      password: 'password123',
      name: 'John Doe',
      roles: ['STUDENT'],
      status: 'ACTIVE',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'faculty@example.com',
      password: 'password123',
      name: 'Jane Smith',
      roles: ['FACULTY'],
      status: 'ACTIVE',
    },
  });

  // Seed Reports
  await prisma.report.create({
    data: {
      userId: user1.id,
      title: 'Lost Wallet',
      reportType: 'Lost Item',
      description: 'I lost my wallet near the cafeteria.',
    },
  });

  await prisma.report.create({
    data: {
      userId: user2.id,
      title: 'Security Concern',
      reportType: 'Security Concern',
      description: 'There was a suspicious person in the library.',
    },
  });

  console.log('Seeding completed.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });