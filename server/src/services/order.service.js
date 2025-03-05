const { PrismaClient } = require("@prisma/client");
const crypto = require('crypto');
const prisma = new PrismaClient();

exports.createOrder = async (userId, cartItems) => {
  try {
    console.log("Creating order for user:", userId, "with items:", JSON.stringify(cartItems));
    
    const pickupTime = new Date();
    pickupTime.setMinutes(pickupTime.getMinutes() + 30);

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
        
        const order = await tx.preorder.create({
          data: {
            userId,
            mealId: item.mealId,
            quantity: item.quantity,
            pickupTime,
            verificationCode
          },
          include: {
            meal: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        });
        
        orders.push(order);
      }

      // Clear the cart after order is placed
      try {
        await tx.cart.update({
          where: { userId },
          data: { items: { deleteMany: {} } }
        });
      } catch (err) {
        console.log("Failed to clear cart, but order was created:", err);
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
          firstName: true,
          lastName: true,
          email: true
        }
      }
    },
    orderBy: {
      orderTime: 'desc'
    }
  });
};

exports.updateOrderStatus = async (orderId, status) => {
  const validStatuses = ['placed', 'ready', 'picked_up', 'cancelled'];
  
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }
  
  return await prisma.preorder.update({
    where: { id: parseInt(orderId) },
    data: { status },
    include: {
      meal: true
    }
  });
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
            firstName: true,
            lastName: true,
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
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      }
    });

    return updatedOrder;
  } catch (error) {
    console.error('Order verification error:', error);
    throw error;
  }
};


// Get all orders for management
exports.getAllOrders = async () => {
  return await prisma.preorder.findMany({
    include: {
      meal: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
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
};


// Approve an order
exports.approveOrder = async (orderId) => {
  // Check if order exists
  const order = await prisma.preorder.findUnique({
    where: { id: orderId }
  });
  
  if (!order) {
    throw new Error("Order not found");
  }
  
  // Update the order status to placed (approved)
  return await prisma.preorder.update({
    where: { id: orderId },
    data: { 
      status: 'placed',
      rejectionReason: null // Clear any previous rejection reason
    },
    include: {
      meal: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true
        }
      }
    }
  });
};


// Reject an order with reason
exports.rejectOrder = async (orderId, rejectionReason) => {
  // Check if order exists
  const order = await prisma.preorder.findUnique({
    where: { id: orderId }
  });
  
  if (!order) {
    throw new Error("Order not found");
  }
  
  // Update the order status to cancelled with a reason
  return await prisma.preorder.update({
    where: { id: orderId },
    data: { 
      status: 'cancelled',
      rejectionReason: rejectionReason
    },
    include: {
      meal: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true
        }
      }
    }
  });
};