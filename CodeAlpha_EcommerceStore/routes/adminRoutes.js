const express = require("express");

const router = express.Router();

const {
  adminTest,
  getAllOrders,
  getAdminDashboard,
  updateOrderStatus,
} = require("../controllers/adminController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// ADMIN DASHBOARD
router.get(
  "/",
  authMiddleware,
  adminMiddleware,
  getAdminDashboard
);

// VIEW ALL ORDERS
router.get(
  "/orders",
  authMiddleware,
  adminMiddleware,
  getAllOrders
);

// UPDATE ORDER STATUS
router.post(
  "/orders/:id/status",
  authMiddleware,
  adminMiddleware,
  updateOrderStatus
);

module.exports = router;