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

exports.verifyOrder = async (verificationCode) => {
  const order = await prisma.preorder.findUnique({
    where: { verificationCode },
    include: { meal: true }
  });
  
  if (!order) {
    throw new Error("Order not found");
  }
  
  // Don't allow reverification of already picked up orders
  if (order.status === 'picked_up') {
    throw new Error("Order has already been picked up");
  }
  
  return await prisma.preorder.update({
    where: { id: order.id },
    data: { status: 'picked_up' },
    include: { meal: true }
  });
};