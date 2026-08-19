const express = require("express");

const router = express.Router();

const {
  getProfile,
  updateProfile,
} = require("../controllers/profileController");

const authMiddleware = require("../middleware/authMiddleware");

// SHOW PROFILE
router.get(
  "/",
  authMiddleware,
  getProfile
);

// UPDATE PROFILE
router.post(
  "/update",
  authMiddleware,
  updateProfile
);

module.exports = router;