const { prisma } = require('../services/database.service');
const { logger } = require('../utils/logger.util');

/**
 * Get all reports
 */
const getAllReports = async () => {
  try {
    logger.debug('Retrieving all reports');
    return await prisma.report.findMany({
      include: {
        user: true, // Include user information if needed
      },
    });
  } catch (error) {
    logger.error('Error retrieving reports:', error);
    throw error;
  }
};

module.exports = {
  getAllReports,
};
