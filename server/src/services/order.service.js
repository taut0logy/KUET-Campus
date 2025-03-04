const { PrismaClient } = require("@prisma/client");
const crypto = require('crypto');
const prisma = new PrismaClient();

exports.createOrderFromCart = async (userId, cartItems) => {
  const pickupTime = new Date();
  pickupTime.setMinutes(pickupTime.getMinutes() + 30);

  // Create all orders in a transaction
  return await prisma.$transaction(async (tx) => {
    const orders = await Promise.all(
      cartItems.map(async (item) => {
        const verificationCode = crypto.randomBytes(4).toString('hex').toUpperCase();
        
        return await tx.preorder.create({
          data: {
            userId,
            menuMealId: item.menuMealId,
            quantity: item.quantity,
            pickupTime,
            verificationCode,
            status: 'placed'
          },
          include: {
            menuMeal: {
              include: {
                meal: true
              }
            },
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        });
      })
    );

    // Clear the user's cart after successful order creation
    await tx.cartItem.deleteMany({
      where: {
        cart: {
          userId
        }
      }
    });

    return orders;
  });
};

exports.getUserOrders = async (userId) => {
  return await prisma.preorder.findMany({
    where: {
      userId
    },
    include: {
      menuMeal: {
        include: {
          meal: true
        }
      },
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