const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { orderValidator } = require('../middleware/validators/order.validator');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.post('/', authenticate, orderValidator, orderController.createOrder);
router.get('/', authenticate, orderController.getOrders);
router.put('/:id/status', authenticate, authorize('ADMIN'), orderController.updateOrderStatus);
router.post('/verify', authenticate, authorize('ADMIN'), orderController.verifyOrder);

module.exports = router;