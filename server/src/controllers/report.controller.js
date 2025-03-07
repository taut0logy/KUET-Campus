const reportService = require('../services/report.service');
const { sendSuccess, sendError } = require('../utils/response.util');
const { logger } = require('../utils/logger.util');
const { validationResult } = require('express-validator');

/**
 * Get all reports
 */
const getReports = async (req, res, next) => {
  try {
    const reports = await reportService.getAllReports();
    return sendSuccess(res, { reports }, 'Reports retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving reports:', error);
    next(error);
  }
};

module.exports = {
  getReports,
};
