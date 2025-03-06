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

/**
 * Get all drivers
 */
const getAllDrivers = async () => {
  try {
    logger.debug('Retrieving all drivers');
    return await prisma.driver.findMany();
  } catch (error) {
    logger.error('Error retrieving drivers:', error);
    throw error;
  }
};

/**
 * Create a new driver
 */
const createDriver = async (driverData) => {
  try {
    logger.debug('Creating a new driver', driverData);
    return await prisma.driver.create({
      data: driverData
    });
  } catch (error) {
    logger.error('Error creating driver:', error);
    throw error;
  }
};

/**
 * Update a driver
 */
const updateDriver = async (id, driverData) => {
  try {
    logger.debug(`Updating driver with ID: ${id}`, driverData);
    return await prisma.driver.update({
      where: { id },
      data: driverData
    });
  } catch (error) {
    logger.error(`Error updating driver with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a driver
 */
const deleteDriver = async (id) => {
  try {
    logger.debug(`Deleting driver with ID: ${id}`);
    return await prisma.driver.delete({
      where: { id }
    });
  } catch (error) {
    logger.error(`Error deleting driver with ID ${id}:`, error);
    throw error;
  }
};

module.exports = {
  getAllBuses,
  getBusById,
  createBus,
  updateBus,
  deleteBus,
  getAllDrivers,
  createDriver,
  updateDriver,
  deleteDriver,
};
