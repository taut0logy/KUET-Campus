const { prisma } = require('../services/database.service');
const { logger } = require('../utils/logger.util');

/**
 * Get all meals
 */
const getAllMeals = async () => {
  try {
    logger.debug('Retrieving all meals');
    const meals = await prisma.meal.findMany();
    return meals;
  } catch (error) {
    logger.error('Error retrieving meals:', error);
    throw error;
  }
};

/**
 * Get meal by ID
 */
const getMealById = async (id) => {
  try {
    logger.debug(`Getting meal with ID: ${id}`);
    
    return await prisma.meal.findUnique({
      where: { id: parseInt(id) }
    });
  } catch (error) {
    logger.error(`Error retrieving meal with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new meal
 */
const createMeal = async (mealData) => {
  try {
    logger.debug('Creating a new meal', mealData);
    
    return await prisma.meal.create({
      data: mealData
    });
  } catch (error) {
    logger.error('Error creating meal:', error);
    throw error;
  }
};

/**
 * Update a meal
 */
const updateMeal = async (id, mealData) => {
  try {
    logger.debug(`Updating meal with ID: ${id}`, mealData);
    
    return await prisma.meal.update({
      where: { id: parseInt(id) },
      data: mealData
    });
  } catch (error) {
    logger.error(`Error updating meal with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a meal
 */
const deleteMeal = async (id) => {
  try {
    logger.debug(`Deleting meal with ID: ${id}`);
    
    return await prisma.meal.delete({
      where: { id: parseInt(id) }
    });
  } catch (error) {
    logger.error(`Error deleting meal with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Get all menus, optionally filtered by date
 */
const getMenus = async (date) => {
  try {
    logger.debug('Retrieving menus', date ? { date } : 'all');
    
    
    let query = {
      include: {
        menuMeals: {
          include: {
            meal: true
          }
        }
      }
    };

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      query.where = {
        date: {
          gte: startDate,
          lte: endDate
        }
      };
    }

    return await prisma.menu.findMany(query);
  } catch (error) {
    logger.error('Error retrieving menus:', error);
    throw error;
  }
};

/**
 * Get menu by ID
 */
const getMenuById = async (id) => {
  try {
    logger.debug(`Getting menu with ID: ${id}`);
    
    return await prisma.menu.findUnique({
      where: { id: parseInt(id) },
      include: {
        menuMeals: {
          include: {
            meal: true
          }
        }
      }
    });
  } catch (error) {
    logger.error(`Error retrieving menu with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Get today's menu
 */
const getTodayMenu = async () => {
  try {
    logger.debug('Getting today\'s menu');
    
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return await prisma.menu.findFirst({
      where: {
        date: {
          gte: today,
          lt: tomorrow
        }
      },
      include: {
        menuMeals: {
          include: {
            meal: true
          }
        }
      }
    });
  } catch (error) {
    logger.error('Error retrieving today\'s menu:', error);
    throw error;
  }
};

/**
 * Create a new menu
 */
const createMenu = async (menuData) => {
  try {
    const { date, meals } = menuData;
    
    // Convert date string to Date object if necessary
    const menuDate = typeof date === 'string' ? new Date(date) : date;
    
    return await prisma.$transaction(async (prisma) => {
      // Create the menu
      const menu = await prisma.menu.create({
        data: {
          date: menuDate
        }
      });
      
      // Add meals to the menu if provided
      if (meals && meals.length > 0) {
        const menuMeals = await Promise.all(
          meals.map(async (mealItem) => {
            return prisma.menuMeal.create({
              data: {
                menuId: menu.id,
                mealId: mealItem.mealId,
                price: mealItem.price,
                available: mealItem.available ?? true
              }
            });
          })
        );
        
        return { ...menu, menuMeals };
      }
      
      return menu;
    });
  } catch (error) {
    logger.error('Error creating menu:', error);
    throw error;
  }
};

/**
 * Update a menu
 */
const updateMenu = async (id, menuData) => {
  try {
    const { date, meals } = menuData;
    
    return await prisma.$transaction(async (prisma) => {
      // Update menu date if provided
      let menu = { id: parseInt(id) };
      
      if (date) {
        menu = await prisma.menu.update({
          where: { id: parseInt(id) },
          data: { date: new Date(date) }
        });
      }
      
      // Update menu meals if provided
      if (meals && meals.length > 0) {
        // Get current menu meals
        const currentMenuMeals = await prisma.menuMeal.findMany({
          where: { menuId: parseInt(id) },
          select: { id: true, mealId: true }
        });
        
        // Create map of current meal IDs for quick lookup
        const currentMealMap = new Map(
          currentMenuMeals.map(item => [item.mealId, item.id])
        );
        
        // Process each meal in the update
        for (const meal of meals) {
          if (currentMealMap.has(meal.mealId)) {
            // Update existing menu meal
            await prisma.menuMeal.update({
              where: { id: currentMealMap.get(meal.mealId) },
              data: {
                price: meal.price,
                available: meal.available
              }
            });
            // Remove from map to track processed items
            currentMealMap.delete(meal.mealId);
          } else {
            // Add new menu meal
            await prisma.menuMeal.create({
              data: {
                menuId: parseInt(id),
                mealId: meal.mealId,
                price: meal.price,
                available: meal.available ?? true
              }
            });
          }
        }
        
        // Remove any meals that were not in the update if removeOthers flag is true
        if (menuData.removeOthers && currentMealMap.size > 0) {
          await prisma.menuMeal.deleteMany({
            where: {
              id: {
                in: Array.from(currentMealMap.values())
              }
            }
          });
        }
      }
      
      // Return updated menu with meals
      return await prisma.menu.findUnique({
        where: { id: parseInt(id) },
        include: {
          menuMeals: {
            include: {
              meal: true
            }
          }
        }
      });
    });
  } catch (error) {
    logger.error(`Error updating menu with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a menu
 */
const deleteMenu = async (id) => {
  try {
    return await prisma.$transaction(async (prisma) => {
      // Delete related menu meals first
      await prisma.menuMeal.deleteMany({
        where: { menuId: parseInt(id) }
      });
      
      // Then delete the menu
      return await prisma.menu.delete({
        where: { id: parseInt(id) }
      });
    });
  } catch (error) {
    logger.error(`Error deleting menu with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Toggle meal availability in a menu
 */
const toggleMealAvailability = async (menuMealId, available) => {
  try {
    logger.debug(`Toggling availability for menu meal ID ${menuMealId} to ${available}`);
    
    
    return await prisma.menuMeal.update({
      where: { id: parseInt(menuMealId) },
      data: { available },
      include: { meal: true }
    });
  } catch (error) {
    logger.error(`Error toggling availability for menu meal ID ${menuMealId}:`, error);
    throw error;
  }
};

/**
 * Create a preorder
 */
const createPreorder = async (userId, menuMealId) => {
  try {
    logger.debug(`Creating preorder for user ${userId} and menu meal ${menuMealId}`);
    
    
    // Check if menu meal exists and is available
    const menuMeal = await prisma.menuMeal.findUnique({
      where: { id: parseInt(menuMealId) },
      include: {
        meal: true,
        menu: true
      }
    });
    
    if (!menuMeal) {
      throw new Error('Menu meal not found');
    }
    
    if (!menuMeal.available) {
      throw new Error('This meal is not currently available for ordering');
    }
    
    // Check if menu is for today or future date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (menuMeal.menu.date < today) {
      throw new Error('Cannot preorder from a past menu');
    }
    
    // Create the preorder
    return await prisma.preorder.create({
      data: {
        userId,
        menuMealId: parseInt(menuMealId),
        status: 'placed'
      },
      include: {
        menuMeal: {
          include: {
            meal: true
          }
        }
      }
    });
  } catch (error) {
    logger.error('Error creating preorder:', error);
    throw error;
  }
};

/**
 * Get user preorders
 */
const getUserPreorders = async (userId) => {
  try {
    logger.debug(`Getting preorders for user ${userId}`);
    
    
    return await prisma.preorder.findMany({
      where: { userId },
      include: {
        menuMeal: {
          include: {
            meal: true,
            menu: true
          }
        }
      },
      orderBy: {
        orderTime: 'desc'
      }
    });
  } catch (error) {
    logger.error(`Error retrieving preorders for user ${userId}:`, error);
    throw error;
  }
};

/**
 * Update preorder status
 */
const updatePreorderStatus = async (orderId, status) => {
  try {
    const validStatuses = ['placed', 'ready', 'picked_up', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }
    
    return await prisma.preorder.update({
      where: { id: parseInt(orderId) },
      data: { status },
      include: {
        menuMeal: {
          include: {
            meal: true
          }
        }
      }
    });
  } catch (error) {
    logger.error(`Error updating status for preorder ${orderId}:`, error);
    throw error;
  }
};

/**
 * Cancel a preorder
 */
const cancelPreorder = async (orderId, userId) => {
  try {
    // Check if the preorder exists and belongs to the user
    const preorder = await prisma.preorder.findUnique({
      where: { id: parseInt(orderId) }
    });
    
    if (!preorder) {
      throw new Error('Preorder not found');
    }
    
    if (preorder.userId !== userId) {
      throw new Error('You are not authorized to cancel this preorder');
    }
    
    // Check if the preorder is already picked up
    if (preorder.status === 'picked_up') {
      throw new Error('Cannot cancel a picked up order');
    }
    
    // Cancel the preorder
    return await prisma.preorder.update({
      where: { id: parseInt(orderId) },
      data: { status: 'cancelled' }
    });
  } catch (error) {
    logger.error(`Error cancelling preorder ${orderId}:`, error);
    throw error;
  }
};

module.exports = {
  // Meal functions
  getAllMeals,
  getMealById,
  createMeal,
  updateMeal,
  deleteMeal,
  
  // Menu functions
  getMenus,
  getMenuById,
  getTodayMenu,
  createMenu,
  updateMenu,
  deleteMenu,
  toggleMealAvailability,
  
  // Preorder functions
  createPreorder,
  getUserPreorders,
  updatePreorderStatus,
  cancelPreorder
};