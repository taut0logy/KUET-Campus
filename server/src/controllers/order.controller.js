const orderService = require('../services/order.service');
const { validationResult } = require('express-validator');

exports.createOrder = async (req, res) => {
  const userId = req.user.id;
  const { items } = req.body;

  console.log("Order request received for user:", userId);
  console.log("Items in request:", JSON.stringify(items));

  if (!items || !Array.isArray(items)) {
    return res.status(400).json({ error: "Invalid cart items" });
  }

  try {
    const orders = await orderService.createOrder(userId, items);
    return res.json({ orders });
  } catch (error) {
    console.error("Error in createOrder controller:", error);
    return res.status(500).json({
      error: "Failed to create order",
      details: error.message
    });
  }
};

exports.getOrders = async (req, res) => {
  const userId = req.user.id;
  try {
    const orders = await orderService.getUserOrders(userId);
    return res.json({ orders });
  } catch (error) {
    console.error("Error in getOrders controller:", error);
    return res.status(500).json({ error: "Failed to fetch orders" });
  }
};

exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const order = await orderService.updateOrderStatus(parseInt(id), status);
    return res.json({ order });
  } catch (error) {
    console.error("Error in updateOrderStatus controller:", error);
    return res.status(500).json({ error: "Failed to update order status" });
  }
};

exports.verifyOrder = async (req, res) => {
  const { verificationCode } = req.body;
  try {
    const order = await orderService.verifyOrder(verificationCode);
    return res.json({ order });
  } catch (error) {
    console.error("Error in verifyOrder controller:", error);
    return res.status(500).json({ error: "Failed to verify order" });
  }
};