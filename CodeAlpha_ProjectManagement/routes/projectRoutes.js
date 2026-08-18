const express = require("express");
const router = express.Router();

const {
    showDashboard,
    showCreateProject,
    createProject,
    showProject,
    showEditProject,
    updateProject,
    deleteProject,
    showMembers,
    addMember,
    removeMember,
} = require("../controllers/projectController");

const { isAuthenticated } = require("../middleware/authMiddleware");

router.get("/dashboard", isAuthenticated, showDashboard);

router.get("/projects/create", isAuthenticated, showCreateProject);
router.post("/projects", isAuthenticated, createProject);

router.get("/projects/:id", isAuthenticated, showProject);

router.get("/projects/:id/edit", isAuthenticated, showEditProject);
router.post("/projects/:id/edit", isAuthenticated, updateProject);

router.post("/projects/:id/delete", isAuthenticated, deleteProject);
router.get("/projects/:id/members", isAuthenticated, showMembers);
router.post("/projects/:id/members", isAuthenticated, addMember);
router.post("/projects/:id/members/:userId/delete", isAuthenticated, removeMember);

module.exports = router;
