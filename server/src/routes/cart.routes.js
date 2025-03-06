const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cart.controller");
const { addToCartValidator } = require('../middleware/validators/cart.validator');
const { authenticate } = require("../middleware/auth.middleware");

//get cart
router.get("/", authenticate, cartController.getCart);
//add to cart
router.post("/add", authenticate, addToCartValidator, cartController.addToCart);
//remove from cart
router.delete("/item/:id", authenticate, cartController.removeFromCart);
//update cart item quantity
router.put("/item/:id", authenticate, cartController.updateCartItemQuantity);
module.exports = router;
