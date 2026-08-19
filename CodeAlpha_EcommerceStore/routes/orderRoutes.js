const express = require("express");

const router = express.Router();

const {
  getMyOrders,
  getOrderDetails,
} = require("../controllers/orderController");

const authMiddleware = require("../middleware/authMiddleware");

// USER ORDERS
router.get(
  "/",
  authMiddleware,
  getMyOrders
);

// ORDER DETAILS
router.get(
  "/:id",
  authMiddleware,
  getOrderDetails
);

module.exports = router;