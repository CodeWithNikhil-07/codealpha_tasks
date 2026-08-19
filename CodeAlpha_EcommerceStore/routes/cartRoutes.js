const express = require("express");

const router = express.Router();

const {
  addToCart,
  getCart,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
} = require("../controllers/cartController");

const authMiddleware = require("../middleware/authMiddleware");

// VIEW CART

router.get("/", authMiddleware, getCart);

// ADD TO CART

router.post("/add/:id", authMiddleware, addToCart);

// INCREASE QUANTITY

router.post("/increase/:id", authMiddleware, increaseQuantity);

// DECREASE QUANTITY

router.post("/decrease/:id", authMiddleware, decreaseQuantity);

// REMOVE FROM CART

router.post("/remove/:id", authMiddleware, removeFromCart);

module.exports = router;
