const express = require("express");

const router = express.Router();

const {
  getCheckout,
  placeOrder,
  orderSuccess,
} = require("../controllers/checkoutController");

const authMiddleware = require("../middleware/authMiddleware");

// CHECKOUT PAGE
router.get(
  "/",
  authMiddleware,
  getCheckout
);

// PLACE ORDER
router.post(
  "/place-order",
  authMiddleware,
  placeOrder
);

// ORDER SUCCESS
router.get(
  "/success/:id",
  authMiddleware,
  orderSuccess
);

module.exports = router;