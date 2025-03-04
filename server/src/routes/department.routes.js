const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/department.controller');

// Route to get all departments
router.get('/', departmentController.getDepartments);

module.exports = router; 