const reportService = require('../services/report.service');
const { sendSuccess, sendError } = require('../utils/response.util');
const { logger } = require('../utils/logger.util');

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

/**
 * Create a new report
 */
const createReport = async (req, res, next) => {
  try {
    const reportData = req.body;
    const report = await reportService.createReport(reportData);
    return sendSuccess(res, { report }, 'Report created successfully', 201);
  } catch (error) {
    logger.error('Error creating report:', error);
    next(error);
  }
};

/**
 * Update a report
 */
const updateReport = async (req, res, next) => {
  const { id } = req.params;
  try {
    const reportData = req.body;
    const report = await reportService.updateReport(id, reportData);
    return sendSuccess(res, { report }, 'Report updated successfully');
  } catch (error) {
    logger.error(`Error updating report with ID ${id}:`, error);
    next(error);
  }
};

/**
 * Delete a report
 */
const deleteReport = async (req, res, next) => {
  const { id } = req.params;
  try {
    await reportService.deleteReport(id);
    return sendSuccess(res, null, 'Report deleted successfully');
  } catch (error) {
    logger.error(`Error deleting report with ID ${id}:`, error);
    next(error);
  }
};

module.exports = {
  getReports,
  createReport,
  updateReport,
  deleteReport,
};
