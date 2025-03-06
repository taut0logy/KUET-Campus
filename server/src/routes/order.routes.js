const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { orderValidator } = require('../middleware/validators/order.validator');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.post('/', authenticate, orderValidator, orderController.createOrder);
router.get('/', authenticate, orderController.getOrders);

// New and modified routes for CAFE_MANAGER
router.get('/manage', authenticate, authorize('CAFE_MANAGER'), orderController.getOrdersForManagement);
router.put('/:id/status', authenticate, authorize(['CAFE_MANAGER']), orderController.updateOrderStatus);
router.post('/verify', authenticate, authorize(['CAFE_MANAGER']), orderController.verifyOrder);

module.exports = router;