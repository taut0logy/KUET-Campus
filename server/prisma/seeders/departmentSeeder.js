const { prisma } = require('../../src/services/database.service');

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

seedDepartments().catch(e => {
  console.error(e);
  process.exit(1);
}); 

module.exports = seedDepartments;