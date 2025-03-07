const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { createReportValidator } = require('../middleware/validators/report.validator');
const { authenticate } = require('../middleware/auth.middleware');

// Remove the POST route for creating a new report
// router.post('/', authenticate, createReportValidator, reportController.createReport);

// GET all reports
router.get('/', reportController.getReports);

module.exports = router;
