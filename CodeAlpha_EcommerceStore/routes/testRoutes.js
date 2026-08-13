const express = require("express");
const isLoggedIn = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/protected", isLoggedIn, (req, res) => {
  res.send("You are logged in and can access this page!");
});

module.exports = router;
