const { validationResult } = require('express-validator');
const cafeteriaService = require('../services/cafeteria.service');
const { sendSuccess, sendError } = require('../utils/response.util');
const { ValidationError } = require('../middleware/error.middleware');
const { logger } = require('../utils/logger.util');

/**
 * Get all meals
 */
const getMeals = async (req, res, next) => {
  try {
    const meals = await cafeteriaService.getAllMeals();
    return sendSuccess(res, { meals }, 'Meals retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving meals:', error);
    next(error);
  }
};

/**
 * Get meal by ID
 */
const getMealById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const meal = await cafeteriaService.getMealById(id);
    
    if (!meal) {
      return sendError(res, 'Meal not found', 404);
    }
    
    return sendSuccess(res, { meal }, 'Meal retrieved successfully');
  } catch (error) {
    logger.error(`Error retrieving meal with ID ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Create a new meal
 */
const createMeal = async (req, res, next) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => `${err.path}: ${err.msg}`).join(', ');
      logger.debug('Validation errors:', errors.array());
      throw new ValidationError(`Validation failed: ${errorMessages}`, errors.array());
    }
    
    const mealData = req.body;
    const meal = await cafeteriaService.createMeal(mealData);
    
    return sendSuccess(res, { meal }, 'Meal created successfully', 201);
  } catch (error) {
    logger.error('Error creating meal:', error);
    next(error);
  }
};

/**
 * Update a meal
 */
const updateMeal = async (req, res, next) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => `${err.path}: ${err.msg}`).join(', ');
      logger.debug('Validation errors:', errors.array());
      throw new ValidationError(`Validation failed: ${errorMessages}`, errors.array());
    }
    
    const { id } = req.params;
    const mealData = req.body;
    
    const meal = await cafeteriaService.updateMeal(id, mealData);
    
    return sendSuccess(res, { meal }, 'Meal updated successfully');
  } catch (error) {
    logger.error(`Error updating meal with ID ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Delete a meal
 */
const deleteMeal = async (req, res, next) => {
  try {
    const { id } = req.params;
    await cafeteriaService.deleteMeal(id);
    
    return sendSuccess(res, null, 'Meal deleted successfully');
  } catch (error) {
    logger.error(`Error deleting meal with ID ${req.params.id}:`, error);
    
    if (error.code === 'P2025') {
      return sendError(res, 'Meal not found', 404);
    }
    
    if (error.code === 'P2003') {
      return sendError(res, 'Cannot delete meal because it is referenced in menus', 400);
    }
    
    next(error);
  }
};

/**
 * Get all menus, optionally filtered by date
 */
const getMenus = async (req, res, next) => {
  try {
    const { date } = req.query;
    const menus = await cafeteriaService.getMenus(date);
    
    return sendSuccess(res, { menus }, 'Menus retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving menus:', error);
    next(error);
  }
};

/**
 * Get menu by ID
 */
const getMenuById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const menu = await cafeteriaService.getMenuById(id);
    
    if (!menu) {
      return sendError(res, 'Menu not found', 404);
    }
    
    return sendSuccess(res, { menu }, 'Menu retrieved successfully');
  } catch (error) {
    logger.error(`Error retrieving menu with ID ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Get today's menu
 */
const getTodayMenu = async (req, res, next) => {
  try {
    const menu = await cafeteriaService.getTodayMenu();
    
    if (!menu) {
      return sendError(res, 'No menu available for today', 404);
    }
    
    return sendSuccess(res, { menu }, 'Today\'s menu retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving today\'s menu:', error);
    next(error);
  }
};

/**
 * Create a new menu
 */
const createMenu = async (req, res, next) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => `${err.path}: ${err.msg}`).join(', ');
      logger.debug('Validation errors:', errors.array());
      throw new ValidationError(`Validation failed: ${errorMessages}`, errors.array());
    }
    
    const menuData = req.body;
    const menu = await cafeteriaService.createMenu(menuData);
    
    return sendSuccess(res, { menu }, 'Menu created successfully', 201);
  } catch (error) {
    logger.error('Error creating menu:', error);
    next(error);
  }
};

/**
 * Update a menu
 */
const updateMenu = async (req, res, next) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => `${err.path}: ${err.msg}`).join(', ');
      logger.debug('Validation errors:', errors.array());
      throw new ValidationError(`Validation failed: ${errorMessages}`, errors.array());
    }
    
    const { id } = req.params;
    const menuData = req.body;
    
    const menu = await cafeteriaService.updateMenu(id, menuData);
    
    return sendSuccess(res, { menu }, 'Menu updated successfully');
  } catch (error) {
    logger.error(`Error updating menu with ID ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Delete a menu
 */
const deleteMenu = async (req, res, next) => {
  try {
    const { id } = req.params;
    await cafeteriaService.deleteMenu(id);
    
    return sendSuccess(res, null, 'Menu deleted successfully');
  } catch (error) {
    logger.error(`Error deleting menu with ID ${req.params.id}:`, error);
    
    if (error.code === 'P2025') {
      return sendError(res, 'Menu not found', 404);
    }
    
    next(error);
  }
};

/**
 * Toggle meal availability in a menu
 */
const toggleMealAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { available } = req.body;
    
    if (typeof available !== 'boolean') {
      return sendError(res, 'Available status must be a boolean', 400);
    }
    
    const menuMeal = await cafeteriaService.toggleMealAvailability(id, available);
    
    return sendSuccess(
      res, 
      { menuMeal }, 
      `Meal ${available ? 'enabled' : 'disabled'} successfully`
    );
  } catch (error) {
    logger.error(`Error toggling availability for menu meal ID ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Create a preorder
 */
const createPreorder = async (req, res, next) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => `${err.path}: ${err.msg}`).join(', ');
      logger.debug('Validation errors:', errors.array());
      throw new ValidationError(`Validation failed: ${errorMessages}`, errors.array());
    }
    
    const { menuMealId } = req.body;
    const userId = req.user.id;
    
    const preorder = await cafeteriaService.createPreorder(userId, menuMealId);
    
    return sendSuccess(res, { preorder }, 'Preorder created successfully', 201);
  } catch (error) {
    logger.error('Error creating preorder:', error);
    
    if (error.message.includes('not available') || 
        error.message.includes('past menu')) {
      return sendError(res, error.message, 400);
    }
    
    next(error);
  }
};

/**
 * Get user preorders
 */
const getUserPreorders = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const preorders = await cafeteriaService.getUserPreorders(userId);
    
    return sendSuccess(res, { preorders }, 'Preorders retrieved successfully');
  } catch (error) {
    logger.error(`Error retrieving preorders for user ${req.user.id}:`, error);
    next(error);
  }
};

/**
 * Update preorder status (admin only)
 */
const updatePreorderStatus = async (req, res, next) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => `${err.path}: ${err.msg}`).join(', ');
      logger.debug('Validation errors:', errors.array());
      throw new ValidationError(`Validation failed: ${errorMessages}`, errors.array());
    }
    
    const { id } = req.params;
    const { status } = req.body;
    
    const preorder = await cafeteriaService.updatePreorderStatus(id, status);
    
    return sendSuccess(res, { preorder }, 'Preorder status updated successfully');
  } catch (error) {
    logger.error(`Error updating status for preorder ${req.params.id}:`, error);
    
    if (error.message.includes('Invalid status')) {
      return sendError(res, error.message, 400);
    }
    
    next(error);
  }
};

/**
 * Cancel a preorder
 */
const cancelPreorder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    await cafeteriaService.cancelPreorder(id, userId);
    
    return sendSuccess(res, null, 'Preorder cancelled successfully');
  } catch (error) {
    logger.error(`Error cancelling preorder ${req.params.id}:`, error);
    
    if (error.message.includes('not authorized') || 
        error.message.includes('Cannot cancel')) {
      return sendError(res, error.message, 400);
    }
    
    if (error.message.includes('not found')) {
      return sendError(res, 'Preorder not found', 404);
    }
    
    next(error);
  }
};

module.exports = {
  // Meal controllers
  getMeals,
  getMealById,
  createMeal,
  updateMeal,
  deleteMeal,
  
  // Menu controllers
  getMenus,
  getMenuById,
  getTodayMenu,
  createMenu,
  updateMenu,
  deleteMenu,
  toggleMealAvailability,
  
  // Preorder controllers
  createPreorder,
  getUserPreorders,
  updatePreorderStatus,
  cancelPreorder
};