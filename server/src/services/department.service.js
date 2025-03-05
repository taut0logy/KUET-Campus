const { prisma } = require('./database.service');

class DepartmentService {
  async getAllDepartments() {
    return await prisma.department.findMany();
  }
}

const departmentService = new DepartmentService();
module.exports = departmentService;