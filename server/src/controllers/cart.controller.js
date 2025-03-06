const cartService = require("../services/cart.service");
const { validationResult } = require("express-validator");



// get cart
exports.getCart = async (req, res) => {
    const userId = req.user.id;
    
    try {
      const cartItems = await cartService.getCartItems(userId);
      return res.json({ items: cartItems });
    } catch (error) {
      console.error("Error in getCart controller:", error);
      return res.status(500).json({ error: "Failed to fetch cart items" });
    }
  };

// add to cart
exports.addToCart = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { mealId } = req.body;
  const userId = req.user.id;

  try {
    const cartItem = await cartService.addMealToCart(userId, mealId);
    return res.json({ message: "Meal added to cart", cartItem });
  } catch (error) {
    console.error("Error in addToCart controller:", error);
    return res.status(500).json({ error: "Failed to add meal to cart" });
  }
};

// update cart item quantity
exports.updateCartItemQuantity = async (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;
    const userId = req.user.id;
  
    try {
      const updatedItem = await cartService.updateCartItemQuantity(userId, parseInt(id), quantity);
      return res.json({ cartItem: updatedItem });
    } catch (error) {
      console.error("Error in updateCartItemQuantity controller:", error);
      return res.status(500).json({ error: "Failed to update cart item quantity" });
    }
  };

// remove from cart
exports.removeFromCart = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
  
    try {
      await cartService.removeFromCart(userId, parseInt(id));
      return res.json({ message: "Item removed from cart" });
    } catch (error) {
      console.error("Error in removeFromCart controller:", error);
      return res.status(500).json({ error: "Failed to remove item from cart" });
    }
  };