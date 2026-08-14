const express = require("express");

const router = express.Router();

const { addToCart, getCart } = require("../controllers/cartController");

const authMiddleware = require("../middleware/authMiddleware");

// VIEW CART

router.get("/", authMiddleware, getCart);

// ADD TO CART

router.post("/add/:id", authMiddleware, addToCart);

module.exports = router;
