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




// Replace the verifyOrder function with this:

// exports.verifyOrder = async (verificationCode) => {
//   try {
//     console.log('Attempting to verify code:', verificationCode);
    
//     // Find order with matching verification code - CHANGE from "order" to "preorder"
//     const order = await prisma.preorder.findFirst({
//       where: {
//         verificationCode: verificationCode,
//         status: { in: ['placed', 'ready'] } // Only verify orders that are placed or ready
//       },
//       include: {
//         meal: true,
//         user: {
//           select: {
//             id: true,
//             firstName: true,
//             lastName: true,
//             email: true,
//           }
//         }
//       }
//     });

//     if (!order) {
//       const error = new Error('Invalid verification code or order is not ready for pickup');
//       error.statusCode = 404;
//       throw error;
//     }

//     console.log('Order found:', order.id);

//     // Update the order status to 'picked_up' - CHANGE from "order" to "preorder"
//     const updatedOrder = await prisma.preorder.update({
//       where: { id: order.id },
//       data: { 
//         status: 'picked_up',
//         pickupTime: new Date() // Update pickup time to current time
//       },
//       include: {
//         meal: true,
//         user: {
//           select: {
//             id: true,
//             firstName: true,
//             lastName: true,
//             email: true,
//           }
//         }
//       }
//     });

//     return updatedOrder;
//   } catch (error) {
//     console.error('Order verification error:', error);
//     throw error;
//   }
// };

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
    
    console.log('Controller received verification code:', verificationCode);
    const order = await orderService.verifyOrder(verificationCode);
    return res.status(200).json({ order });
  } catch (error) {
    console.error("Order verification error:", error);
    return res.status(400).json({ message: error.message });
  }
};