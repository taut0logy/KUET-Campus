// cart.service.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();


exports.getCartItems = async (userId) => {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            meal: true
          }
        }
      }
    });
  
    if (!cart) {
      return [];
    }
  
    return cart.items;
  };



exports.addMealToCart = async (userId, mealId) => {
  let cart = await prisma.cart.findUnique({
    where: { userId },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
    });
  }

  let cartItem = await prisma.cartItem.findUnique({
    where: {
      cartId_mealId: {
        cartId: cart.id,
        mealId,
      },
    },
  });

  if (cartItem) {
    cartItem = await prisma.cartItem.update({
      where: { id: cartItem.id },
      data: { quantity: cartItem.quantity + 1 },
    });
  } else {
    cartItem = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        mealId,
        quantity: 1,
      },
    });
  }

  return cartItem;
};


exports.removeFromCart = async (userId, cartItemId) => {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          where: { id: cartItemId }
        }
      }
    });
  
    if (!cart || cart.items.length === 0) {
      throw new Error('Cart item not found');
    }
  
    // Delete the cart item
    return await prisma.cartItem.delete({
      where: { id: cartItemId }
    });
  };

  exports.updateCartItemQuantity = async (userId, cartItemId, quantity) => {
    // First verify the cart item belongs to the user
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          where: { id: cartItemId },
          include: { meal: true }
        }
      }
    });
  
    if (!cart || cart.items.length === 0) {
      throw new Error('Cart item not found');
    }
  
    // Update the cart item quantity
    return await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
      include: { meal: true }
    });
  };