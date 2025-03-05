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
  try {
    const { verificationData } = req.body;
    
    if (!verificationData) {
      return res.status(400).json({ message: "Verification data is required" });
    }
    
    // Extract verification code from QR data
    let verificationCode;
    
    if (typeof verificationData === 'string') {
      // Handle text-based verification (backward compatibility)
      verificationCode = verificationData;
    } else {
      // Handle QR code JSON data
      verificationCode = verificationData.verificationCode;
      
      // Additional security check - you can validate the timestamp if needed
      const scanTimestamp = new Date(verificationData.timestamp);
      const currentTime = new Date();
      const timeDifferenceMinutes = (currentTime - scanTimestamp) / (1000 * 60);
      
      // If QR code is older than 10 minutes, reject it
      if (timeDifferenceMinutes > 10) {
        return res.status(400).json({ message: "QR code has expired. Please refresh and try again." });
      }
    }
    
    const order = await orderService.verifyOrder(verificationCode);
    return res.status(200).json({ order });
  } catch (error) {
    console.error("Order verification error:", error);
    return res.status(400).json({ message: error.message });
  }
};