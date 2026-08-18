const express = require("express");
const router = express.Router();

const {
    showCreateTask,
    createTask,
    showTask,
    showEditTask,
    updateTask,
    deleteTask,
} = require("../controllers/taskController");

const { isAuthenticated } = require("../middleware/authMiddleware");

router.get(
    "/projects/:projectId/tasks/create",
    isAuthenticated,
    showCreateTask
);

router.post(
    "/projects/:projectId/tasks",
    isAuthenticated,
    createTask
);

router.get(
    "/tasks/:id",
    isAuthenticated,
    showTask
);

router.get(
    "/tasks/:id/edit",
    isAuthenticated,
    showEditTask
);

router.post(
    "/tasks/:id/edit",
    isAuthenticated,
    updateTask
);

router.post(
    "/tasks/:id/delete",
    isAuthenticated,
    deleteTask
);

module.exports = router;