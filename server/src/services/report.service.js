const { prisma } = require('../services/database.service');
const { logger } = require('../utils/logger.util');

/**
 * Get all reports
 */
const getAllReports = async () => {
  try {
    logger.debug('Retrieving all reports');
    return await prisma.report.findMany();
  } catch (error) {
    logger.error('Error retrieving reports:', error);
    throw error;
  }
};

/**
 * Create a new report
 */
const createReport = async (reportData) => {
  try {
    logger.debug('Creating a new report', reportData);
    return await prisma.report.create({
      data: reportData,
    });
  } catch (error) {
    logger.error('Error creating report:', error);
    throw error;
  }
};

/**
 * Update a report
 */
const updateReport = async (id, reportData) => {
  try {
    logger.debug(`Updating report with ID: ${id}`, reportData);
    return await prisma.report.update({
      where: { id },
      data: reportData,
    });
  } catch (error) {
    logger.error(`Error updating report with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a report
 */
const deleteReport = async (id) => {
  try {
    logger.debug(`Deleting report with ID: ${id}`);
    return await prisma.report.delete({
      where: { id },
    });
  } catch (error) {
    logger.error(`Error deleting report with ID ${id}:`, error);
    throw error;
  }
};

module.exports = {
  getAllReports,
  createReport,
  updateReport,
  deleteReport,
};
