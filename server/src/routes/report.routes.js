const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');

// GET all reports
router.get('/', reportController.getReports);

// POST create a new report
router.post('/', reportController.createReport);

// PUT update a report
router.put('/:id', reportController.updateReport);

// DELETE a report
router.delete('/:id', reportController.deleteReport);

module.exports = router;
