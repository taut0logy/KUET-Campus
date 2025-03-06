const { prisma } = require('../services/database.service');
const { logger } = require('../utils/logger.util');

/**
 * Get all buses
 */
const getAllBuses = async () => {
  try {
    logger.debug('Retrieving all buses');
    return await prisma.bus.findMany();
  } catch (error) {
    logger.error('Error retrieving buses:', error);
    throw error;
  }
};

/**
 * Get bus by ID
 */
const getBusById = async (id) => {
  try {
    logger.debug(`Getting bus with ID: ${id}`);
    return await prisma.bus.findUnique({
      where: { id }
    });
  } catch (error) {
    logger.error(`Error retrieving bus with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new bus
 */
const createBus = async (busData) => {
  try {
    logger.debug('Creating a new bus', busData);
    return await prisma.bus.create({
      data: busData
    });
  } catch (error) {
    logger.error('Error creating bus:', error);
    throw error;
  }
};

/**
 * Update a bus
 */
const updateBus = async (id, busData) => {
  try {
    logger.debug(`Updating bus with ID: ${id}`, busData);
    return await prisma.bus.update({
      where: { id },
      data: busData
    });
  } catch (error) {
    logger.error(`Error updating bus with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a bus
 */
const deleteBus = async (id) => {
  try {
    logger.debug(`Deleting bus with ID: ${id}`);
    return await prisma.bus.delete({
      where: { id }
    });
  } catch (error) {
    logger.error(`Error deleting bus with ID ${id}:`, error);
    throw error;
  }
};

module.exports = {
  getAllBuses,
  getBusById,
  createBus,
  updateBus,
  deleteBus,
};
