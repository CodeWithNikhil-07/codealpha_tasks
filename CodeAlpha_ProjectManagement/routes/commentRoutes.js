const express = require("express");
const router = express.Router();
const { addComment, deleteComment } = require("../controllers/commentController");
const { isAuthenticated } = require("../middleware/authMiddleware");

router.post("/tasks/:taskId/comments", isAuthenticated, addComment);
router.post("/comments/:id/delete", isAuthenticated, deleteComment);

module.exports = router;
