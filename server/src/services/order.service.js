const { PrismaClient } = require("@prisma/client");
const crypto = require('crypto');
const prisma = new PrismaClient();
const realtimeService = require('./realtime.service');

exports.createOrder = async (userId, cartItems) => {
  try {
    console.log("Creating order for user:", userId, "with items:", JSON.stringify(cartItems));
    
    return await prisma.$transaction(async (tx) => {
      // Process cart items directly from the parameter
      if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
        throw new Error("No items in cart");
      }

      // Check if all meals exist
      const mealIds = cartItems.map(item => item.mealId);
      const meals = await tx.meal.findMany({
        where: { id: { in: mealIds } }
      });

      if (meals.length !== mealIds.length) {
        throw new Error("One or more meals not found");
      }

      // Create orders
      const orders = [];
      for (const item of cartItems) {
        const verificationCode = crypto.randomBytes(4).toString('hex').toUpperCase();
        
        // Set a default pickup time 1 hour from now
        const defaultPickupTime = new Date();
        defaultPickupTime.setHours(defaultPickupTime.getHours() + 1);
        
        const order = await tx.preorder.create({
          data: {
            quantity: item.quantity,
            status: 'pending_approval',
            pickupTime: defaultPickupTime,
            verificationCode,
            userId: userId,     // Use direct userId assignment
            mealId: item.mealId // Use direct mealId assignment
          },
          include: {
            meal: true,
            user: {
              select: {
                id: true,       // Include ID for notification
                name: true,
                email: true
              }
            }
          }
        });
        
        orders.push(order);
      }

      // Try to clear the cart
      try {
        const cart = await tx.cart.findFirst({
          where: { userId },
          select: { id: true }
        });
        
        if (cart) {
          await tx.cartItem.deleteMany({
            where: { cartId: cart.id }
          });
        }
      } catch (err) {
        console.error("Failed to clear cart:", err);
        // Continue since orders were created successfully
      }

      return orders;
    });
  } catch (error) {
    console.error("Order creation failed with error:", error);
    throw error;
  }
};


exports.getUserOrders = async (userId) => {
  return await prisma.preorder.findMany({
    where: {
      userId
    },
    include: {
      meal: true,
      user: {
        select: {
          name: true,
          email: true
        }
      }
    },
    orderBy: {
      orderTime: 'desc'
    }
  });
};

exports.updateOrderStatus = async (orderId, status, pickupTime = null) => {
  const validStatuses = ['placed', 'ready', 'picked_up', 'cancelled'];
  
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }
  
  const updateData = { status };
  
  // If pickup time is provided and status is 'ready', update pickup time
  if (pickupTime && status === 'ready') {
    updateData.pickupTime = new Date(pickupTime);
  }
  
  const updatedOrder = await prisma.preorder.update({
    where: { id: parseInt(orderId) },
    data: updateData,
    include: {
      meal: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });

  // Send notification to user
  await realtimeService.createNotification({
    userId: updatedOrder.user.id,
    title: 'Order status updated',
    message: `Your order has been updated to ${status}`
  });

  return updatedOrder;
};

// Update the verifyOrder function

// Fix the verifyOrder function to use preorder instead of order

exports.verifyOrder = async (verificationCode) => {
  try {
    console.log('Service attempting to verify code:', verificationCode);
    
    // Find order with matching verification code - CHANGE from "order" to "preorder"
    const order = await prisma.preorder.findFirst({
      where: {
        verificationCode: verificationCode,
        status: { in: ['placed', 'ready'] } // Only verify orders that are placed or ready
      },
      include: {
        meal: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    if (!order) {
      const error = new Error('Invalid verification code or order is not ready for pickup');
      error.statusCode = 404;
      throw error;
    }

    console.log('Order found:', order.id);

    // Update the order status to 'picked_up' - CHANGE from "order" to "preorder"
    const updatedOrder = await prisma.preorder.update({
      where: { id: order.id },
      data: { 
        status: 'picked_up',
        pickupTime: new Date() // Update pickup time to current time
      },
      include: {
        meal: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    // Send notification to user
    await realtimeService.createNotification({
      userId: updatedOrder.user.id,
      title: 'Order picked up',
      message: `Your order has been picked up at ${updatedOrder.pickupTime}`
    });
    return updatedOrder;
  } catch (error) {
    console.error('Order verification error:', error);
    throw error;
  }
};


// Get all orders for management
exports.getAllOrders = async () => {
  try {
    console.log("Fetching all orders for management...");
    return await prisma.preorder.findMany({
      include: {
        meal: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: [
        {
          status: 'asc' // Put pending and active orders first
        },
        {
          orderTime: 'desc' // Then sort by order time (newest first)
        }
      ]
    });
  } catch (error) {
    console.error("Error in getAllOrders:", error);
    throw error; // Re-throw to let the controller handle it
  }
};


// Approve an order
exports.approveOrder = async (orderId) => {
  try {
    // Check if order exists
    const order = await prisma.preorder.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: { id: true }
        }
      }
    });
    
    if (!order) {
      throw new Error("Order not found");
    }
    
    // Update the order status to placed (approved)
    const updatedOrder = await prisma.preorder.update({
      where: { id: orderId },
      data: { 
        status: 'placed',
        rejectionReason: null // Clear any previous rejection reason
      },
      include: {
        meal: true,
        user: {
          select: {
            id: true,
            name: true,   // Added lastName
            email: true
          }
        }
      }
    });

    // Send notification to user with proper error handling
    try {
      await realtimeService.createNotification({
        userId: order.userId,
        title: 'Order approved',
        message: 'Your order has been approved and is being prepared'
      });
    } catch (notifError) {
      console.error("Failed to send notification but order was approved:", notifError);
    }

    return updatedOrder;
  } catch (error) {
    console.error("Error in approveOrder:", error);
    throw error;
  }
};

// Reject an order with reason
exports.rejectOrder = async (orderId, rejectionReason) => {
  try {
    // Check if order exists
    const order = await prisma.preorder.findUnique({
      where: { id: orderId }
    });
    
    if (!order) {
      throw new Error("Order not found");
    }
    
    // Update the order status to cancelled with a reason
    const updatedOrder = await prisma.preorder.update({
      where: { id: orderId },
      data: { 
        status: 'cancelled',
        rejectionReason: rejectionReason
      },
      include: {
        meal: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Send notification with error handling
    try {
      await realtimeService.createNotification({
        userId: order.userId,
        title: 'Order rejected',
        message: `Your order has been rejected. Reason: ${rejectionReason}`
      });
    } catch (notifError) {
      console.error("Failed to send notification but order was rejected:", notifError);
      // Continue execution
    }

    return updatedOrder;
  } catch (error) {
    console.error("Error in rejectOrder:", error);
    throw error;
  }
};


