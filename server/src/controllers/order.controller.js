const orderService = require('../services/order.service');
const { validationResult } = require('express-validator');

exports.createOrder = async (req, res) => {
  const userId = req.user.id;
  const { items } = req.body;

  console.log("Order request received for user:", userId);
  console.log("Items in request:", JSON.stringify(items));

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Invalid or empty cart items" });
  }

  try {
    // Validate meal IDs are integers
    for (const item of items) {
      if (!item.mealId || typeof item.mealId !== 'number' || !Number.isInteger(item.mealId)) {
        return res.status(400).json({ error: `Invalid meal ID: ${item.mealId}` });
      }
      if (!item.quantity || typeof item.quantity !== 'number' || !Number.isInteger(item.quantity) || item.quantity <= 0) {
        return res.status(400).json({ error: `Invalid quantity for meal ${item.mealId}: ${item.quantity}` });
      }
    }

    const orders = await orderService.createOrder(userId, items);
    return res.status(201).json({ orders });
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



// Get all orders for cafe manager
exports.getOrdersForManagement = async (req, res) => {
  try {
    console.log("CAFE_MANAGER requesting all orders");
    const orders = await orderService.getAllOrders();
    console.log(`Successfully fetched ${orders.length} orders`);
    return res.json({ orders });
  } catch (error) {
    console.error("Error in getOrdersForManagement controller:", error);
    return res.status(500).json({ 
      message: "Failed to fetch orders", 
      details: error.message 
    });
  }
};


exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, approved, rejectionReason, pickupTime } = req.body;
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Validation failed", errors: errors.array() });
    }

    // Handle approvals
    if (approved === true && status === 'placed') {
      const order = await orderService.approveOrder(parseInt(id));
      return res.json({ order });
    }
    
    // Handle rejections with reason
    if (status === 'cancelled' && rejectionReason) {
      const order = await orderService.rejectOrder(parseInt(id), rejectionReason);
      return res.json({ order });
    }
    
    // Regular status update - now includes pickup time
    const order = await orderService.updateOrderStatus(parseInt(id), status, pickupTime);
    return res.json({ order });
  } catch (error) {
    console.error("Error in updateOrderStatus controller:", error);
    return res.status(500).json({ message: error.message || "Failed to update order status" });
  }
};


// Update verification for CAFE_MANAGER
exports.verifyOrder = async (req, res) => {
  try {
    const { verificationData } = req.body;
    
    if (!verificationData) {
      return res.status(400).json({ message: "Verification data is required" });
    }
    
    // Extract verification code
    let verificationCode;
    
    if (typeof verificationData === 'string') {
      verificationCode = verificationData;
    } else {
      verificationCode = verificationData.verificationCode;
    }
    
    console.log('Controller received verification code:', verificationCode);
    const order = await orderService.verifyOrder(verificationCode);
    return res.status(200).json({ order });
  } catch (error) {
    console.error("Order verification error:", error);
    return res.status(400).json({ message: error.message });
  }
};