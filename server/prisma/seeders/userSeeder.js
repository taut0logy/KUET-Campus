import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function seedUsers() {
  console.log('Starting user seeding...');
  
  try {
    // Clean up existing users
    // await prisma.message.deleteMany({});
    // await prisma.chat.deleteMany({});
    // await prisma.studentInfo.deleteMany({});
    // await prisma.facultyInfo.deleteMany({});
    // await prisma.employeeInfo.deleteMany({});
    // await prisma.user.deleteMany({});
    
    console.log('Existing users cleaned up');
    
    // Get all departments for reference
    const departments = await prisma.department.findMany();
    if (departments.length === 0) {
      throw new Error('No departments found. Please run departmentSeeder.js first.');
    }
    
    // Hash a common password for all test users
    const password = await bcrypt.hash('password123', 10);
    
    // Create admin users
    const adminUsers = [];
    for (let i = 0; i < 3; i++) {
      adminUsers.push({
        email: `admin${i + 1}@kuet.ac.bd`,
        password,
        name: faker.person.fullName(),
        roles: ['ADMIN'],
        status: 'ACTIVE',
        emailVerified: true
      });
    }
    
    console.log('Creating admin users...');
    await prisma.user.createMany({
      data: adminUsers
    });
    
    // Create student users
    const studentUsers = [];
    const studentInfos = [];
    
    console.log('Creating student users...');
    for (let i = 0; i < 50; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const name = `${firstName} ${lastName}`;
      const email = faker.internet.email({ firstName, lastName, provider: 'kuet.ac.bd' }).toLowerCase();
      
      const user = await prisma.user.create({
        data: {
          email,
          password,
          name,
          roles: ['STUDENT'],
          status: 'ACTIVE',
          emailVerified: true
        }
      });
      
      // Create student info
      const departmentIndex = faker.number.int({ min: 0, max: departments.length - 1 });
      const department = departments[departmentIndex];
      const batch = faker.number.int({ min: 2018, max: 2023 });
      const section = faker.helpers.arrayElement(['A', 'B', 'C', 'D']);
      
      await prisma.studentInfo.create({
        data: {
          studentId: `${department.alias}${batch.toString().substring(2)}${faker.number.int({ min: 1, max: 999 }).toString().padStart(3, '0')}`,
          section,
          batch,
          departmentId: department.id,
          userId: user.id
        }
      });
    }
    
    // Create faculty users
    console.log('Creating faculty users...');
    for (let i = 0; i < 30; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const name = `${firstName} ${lastName}`;
      const email = faker.internet.email({ firstName, lastName, provider: 'kuet.ac.bd' }).toLowerCase();
      
      const user = await prisma.user.create({
        data: {
          email,
          password,
          name,
          roles: ['FACULTY'],
          status: 'ACTIVE',
          emailVerified: true
        }
      });
      
      // Create faculty info
      const departmentIndex = faker.number.int({ min: 0, max: departments.length - 1 });
      const department = departments[departmentIndex];
      const designation = faker.helpers.arrayElement([
        'PROFESSOR',
        'ASSOCIATE_PROFESSOR',
        'ASSISTANT_PROFESSOR',
        'LECTURER',
        'SENIOR_LECTURER',
        'TEACHERS_ASSISTANT'
      ]);
      const status = faker.helpers.arrayElement(['PERMANENT', 'GUEST', 'PART_TIME']);
      
      await prisma.facultyInfo.create({
        data: {
          employeeId: `F${faker.number.int({ min: 10000, max: 99999 })}`,
          status,
          designation,
          departmentId: department.id,
          bio: faker.lorem.paragraph(),
          userId: user.id
        }
      });
    }
    
    // Create office manager users
    console.log('Creating office manager users...');
    for (let i = 0; i < 5; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const name = `${firstName} ${lastName}`;
      const email = faker.internet.email({ firstName, lastName, provider: 'kuet.ac.bd' }).toLowerCase();
      
      const user = await prisma.user.create({
        data: {
          email,
          password,
          name,
          roles: ['OFFICE_MANAGER'],
          status: 'ACTIVE',
          emailVerified: true
        }
      });
      
      // Create employee info
      await prisma.employeeInfo.create({
        data: {
          employeeId: `OM${faker.number.int({ min: 1000, max: 9999 })}`,
          designation: 'Office Manager',
          userId: user.id
        }
      });
    }
    
    // Create cafe manager users
    console.log('Creating cafe manager users...');
    for (let i = 0; i < 5; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const name = `${firstName} ${lastName}`;
      const email = faker.internet.email({ firstName, lastName, provider: 'kuet.ac.bd' }).toLowerCase();
      
      const user = await prisma.user.create({
        data: {
          email,
          password,
          name,
          roles: ['CAFE_MANAGER'],
          status: 'ACTIVE',
          emailVerified: true
        }
      });
      
      // Create employee info
      await prisma.employeeInfo.create({
        data: {
          employeeId: `CM${faker.number.int({ min: 1000, max: 9999 })}`,
          designation: 'Cafe Manager',
          userId: user.id
        }
      });
    }
    
    // Create some users with multiple roles
    console.log('Creating multi-role users...');
    for (let i = 0; i < 5; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const name = `${firstName} ${lastName}`;
      const email = faker.internet.email({ firstName, lastName, provider: 'kuet.ac.bd' }).toLowerCase();
      
      // Randomly select two roles
      const roles = faker.helpers.arrayElements(
        ['ADMIN', 'FACULTY', 'OFFICE_MANAGER', 'CAFE_MANAGER'],
        faker.number.int({ min: 2, max: 3 })
      );
      
      const user = await prisma.user.create({
        data: {
          email,
          password,
          name,
          roles,
          status: 'ACTIVE',
          emailVerified: true
        }
      });
      
      // If user has FACULTY role, create faculty info
      if (roles.includes('FACULTY')) {
        const departmentIndex = faker.number.int({ min: 0, max: departments.length - 1 });
        const department = departments[departmentIndex];
        const designation = faker.helpers.arrayElement([
          'PROFESSOR',
          'ASSOCIATE_PROFESSOR',
          'ASSISTANT_PROFESSOR',
          'LECTURER',
          'SENIOR_LECTURER',
          'TEACHERS_ASSISTANT'
        ]);
        const status = faker.helpers.arrayElement(['PERMANENT', 'GUEST', 'PART_TIME']);
        
        await prisma.facultyInfo.create({
          data: {
            employeeId: `F${faker.number.int({ min: 10000, max: 99999 })}`,
            status,
            designation,
            departmentId: department.id,
            bio: faker.lorem.paragraph(),
            userId: user.id
          }
        });
      }
      
      // If user has OFFICE_MANAGER or CAFE_MANAGER role, create employee info
      if (roles.includes('OFFICE_MANAGER') || roles.includes('CAFE_MANAGER')) {
        const designation = roles.includes('OFFICE_MANAGER') ? 'Office Manager' : 'Cafe Manager';
        const prefix = roles.includes('OFFICE_MANAGER') ? 'OM' : 'CM';
        
        await prisma.employeeInfo.create({
          data: {
            employeeId: `${prefix}${faker.number.int({ min: 1000, max: 9999 })}`,
            designation,
            userId: user.id
          }
        });
      }
    }
    
    // Create some chat requests between students and faculty
    console.log('Creating chat requests...');
    const students = await prisma.user.findMany({
      where: { roles: { has: 'STUDENT' } },
      include: { studentInfo: true }
    });
    
    const faculty = await prisma.user.findMany({
      where: { roles: { has: 'FACULTY' } },
      include: { facultyInfo: true }
    });
    
    // Create 20 chat requests with different statuses
    for (let i = 0; i < 20; i++) {
      const student = students[faker.number.int({ min: 0, max: students.length - 1 })];
      const facultyMember = faculty[faker.number.int({ min: 0, max: faculty.length - 1 })];
      const status = faker.helpers.arrayElement(['PENDING', 'ACTIVE', 'REJECTED']);
      const channelId = `chat_${student.id}_${facultyMember.id}`;
      
      await prisma.chat.create({
        data: {
          studentId: student.id,
          facultyId: facultyMember.id,
          channelId,
          status,
          createdAt: faker.date.recent({ days: 30 }),
          updatedAt: faker.date.recent({ days: 5 })
        }
      });
    }
    
    console.log('User seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeder
seedUsers()
  .catch((error) => {
    console.error('Error running user seeder:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


export default seedUsers;