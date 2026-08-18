const express = require("express");
const router = express.Router();

const {
  showRegister,
  register,
  showLogin,
  login,
  logout,
} = require("../controllers/authController");

const { isGuest } = require("../middleware/authMiddleware");

router.get("/register", isGuest, showRegister);
router.post("/register", isGuest, register);

router.get("/login", isGuest, showLogin);
router.post("/login", isGuest, login);

router.post("/logout", logout);

module.exports = router;