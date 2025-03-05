const departmentService = require('../services/department.service');

class DepartmentController {
  async getDepartments(req, res) {
    try {
      const departments = await departmentService.getAllDepartments();
      res.json(departments);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

const departmentController = new DepartmentController();
module.exports = departmentController; 