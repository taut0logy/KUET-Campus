const { validationResult } = require('express-validator');
const busService = require('../services/bus.service');
const { sendSuccess, sendError } = require('../utils/response.util');
const { ValidationError } = require('../middleware/error.middleware');
const { logger } = require('../utils/logger.util');

/**
 * Get all buses
 */
const getBuses = async (req, res, next) => {
  try {
    const buses = await busService.getAllBuses();
    return sendSuccess(res, { buses }, 'Buses retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving buses:', error);
    next(error);
  }
};

/**
 * Get bus by ID
 */
const getBusById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const bus = await busService.getBusById(id);
    
    if (!bus) {
      return sendError(res, 'Bus not found', 404);
    }
    
    return sendSuccess(res, { bus }, 'Bus retrieved successfully');
  } catch (error) {
    logger.error(`Error retrieving bus with ID ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Create a new bus
 */
const createBus = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => `${err.path}: ${err.msg}`).join(', ');
      logger.debug('Validation errors:', errors.array());
      throw new ValidationError(`Validation failed: ${errorMessages}`, errors.array());
    }
    
    const busData = req.body;
    const bus = await busService.createBus(busData);
    
    return sendSuccess(res, { bus }, 'Bus created successfully', 201);
  } catch (error) {
    logger.error('Error creating bus:', error);
    next(error);
  }
};

/**
 * Update a bus
 */
const updateBus = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => `${err.path}: ${err.msg}`).join(', ');
      logger.debug('Validation errors:', errors.array());
      throw new ValidationError(`Validation failed: ${errorMessages}`, errors.array());
    }
    
    const { id } = req.params;
    const busData = req.body;
    
    const bus = await busService.updateBus(id, busData);
    
    return sendSuccess(res, { bus }, 'Bus updated successfully');
  } catch (error) {
    logger.error(`Error updating bus with ID ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Delete a bus
 */
const deleteBus = async (req, res, next) => {
  try {
    const { id } = req.params;
    await busService.deleteBus(id);
    
    return sendSuccess(res, null, 'Bus deleted successfully');
  } catch (error) {
    logger.error(`Error deleting bus with ID ${req.params.id}:`, error);
    
    if (error.code === 'P2025') {
      return sendError(res, 'Bus not found', 404);
    }
    
    next(error);
  }
};

module.exports = {
  getBuses,
  getBusById,
  createBus,
  updateBus,
  deleteBus,
};
