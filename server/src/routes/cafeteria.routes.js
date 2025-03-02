const express = require('express');
const router = express.Router();

// Import controller methods
const cafeteriaController = require('../controllers/cafeteria.controller');


// Import validators
const {
  createMealValidator,
  updateMealValidator,
  deleteMealValidator,
  getMealByIdValidator,
  createMenuValidator,
  updateMenuValidator,
  deleteMenuValidator,
  getMenuByIdValidator,
  getMenusValidator,
  toggleMealAvailabilityValidator,
  createPreorderValidator,
  updatePreorderStatusValidator,
  cancelPreorderValidator
} = require('../middleware/validators/cafeteria.validator');

/* ---------------------- Meals Routes ---------------------- */
// GET all meals
router.get('/meals', cafeteriaController.getMeals);

// GET meal by ID
router.get('/meals/:id', getMealByIdValidator, cafeteriaController.getMealById);

// POST create a new meal
router.post('/meals', createMealValidator, cafeteriaController.createMeal);

// PUT update a meal
router.put('/meals/:id', updateMealValidator, cafeteriaController.updateMeal);

// DELETE a meal
router.delete('/meals/:id', deleteMealValidator, cafeteriaController.deleteMeal);

/* ---------------------- Menus Routes ---------------------- */
// GET all menus (optionally filtered by date using a query param)
router.get('/menus', getMenusValidator, cafeteriaController.getMenus);

// GET today's menu
router.get('/menus/today', cafeteriaController.getTodayMenu);

// GET menu by ID
router.get('/menus/:id', getMenuByIdValidator, cafeteriaController.getMenuById);

// POST create a new menu
router.post('/menus', createMenuValidator, cafeteriaController.createMenu);

// PUT update a menu
router.put('/menus/:id', updateMenuValidator, cafeteriaController.updateMenu);

// DELETE a menu
router.delete('/menus/:id', deleteMenuValidator, cafeteriaController.deleteMenu);

// PUT toggle meal availability in a menu
router.put('/menus/meal/:id/toggle-availability', toggleMealAvailabilityValidator, cafeteriaController.toggleMealAvailability);

/* ---------------------- Preorders Routes ---------------------- */
// POST create a preorder (make sure to secure this route if authentication is required)
router.post('/preorders', createPreorderValidator, cafeteriaController.createPreorder);

// GET user preorders
router.get('/preorders', cafeteriaController.getUserPreorders);

// PUT update preorder status (admin only)
router.put('/preorders/:id/status', updatePreorderStatusValidator, cafeteriaController.updatePreorderStatus);

// DELETE cancel a preorder
router.delete('/preorders/:id', cancelPreorderValidator, cafeteriaController.cancelPreorder);

module.exports = router;
