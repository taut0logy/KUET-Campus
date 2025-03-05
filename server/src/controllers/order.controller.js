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



// Update the verifyOrder function

exports.verifyOrder = async (req, res) => {
  try {
    const { verificationData } = req.body;
    
    // Handle both QR data object and direct verification code
    let verificationCode = verificationData;
    
    // Try to parse as JSON if the data looks like JSON
    if (typeof verificationData === 'string' && verificationData.startsWith('{')) {
      try {
        const parsedData = JSON.parse(verificationData);
        verificationCode = parsedData.verificationCode;
      } catch (err) {
        console.log('Not JSON data, using as direct verification code');
      }
    }
    
    if (!verificationCode) {
      return res.status(400).json({ message: 'Verification code is required' });
    }
    
    const order = await orderService.verifyOrder(verificationCode);
    
    return res.status(200).json({
      success: true,
      data: { order },
      message: 'Order verified successfully'
    });
  } catch (error) {
    console.error('Order verification error:', error);
    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || 'Failed to verify order'
    });
  }
};

// Get all orders for cafe manager
exports.getOrdersForManagement = async (req, res) => {
  try {
    const orders = await orderService.getAllOrders();
    return res.json({ orders });
  } catch (error) {
    console.error("Error in getOrdersForManagement controller:", error);
    return res.status(500).json({ message: "Failed to fetch orders" });
  }
};

// Update order status with additional manager features
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, approved, rejectionReason } = req.body;
    
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
    
    // Regular status update
    const order = await orderService.updateOrderStatus(parseInt(id), status);
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
    
    const order = await orderService.verifyOrder(verificationCode);
    return res.status(200).json({ order });
  } catch (error) {
    console.error("Order verification error:", error);
    return res.status(400).json({ message: error.message });
  }
};