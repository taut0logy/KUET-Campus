const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { orderValidator } = require('../middleware/validators/order.validator');
const { authenticate, isAdmin } = require('../middleware/auth.middleware');

router.post('/', authenticate, orderValidator, orderController.createOrder);
router.get('/', authenticate, orderController.getOrders);
router.put('/:id/status', authenticate, isAdmin, orderController.updateOrderStatus);
router.post('/verify', authenticate, isAdmin, orderController.verifyOrder);

module.exports = router;