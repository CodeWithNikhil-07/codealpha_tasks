const Project = require("../models/Project");
const Task = require("../models/Task");
const Comment = require("../models/Comment");
const User = require("../models/User");

const {
    isValidId,
    isOwner,
    isMember,
    findAccessibleProject,
} = require("../utils/access");


const validProjectStatus = [
    "active",
    "completed",
    "archived",
];

const validTaskStatus = [
    "todo",
    "in-progress",
    "completed",
];

const validPriority = [
    "low",
    "medium",
    "high",
];


// Handle Failed Request
const fail = (req, res, path, message) => {
    req.flash("error", message);
    return res.redirect(path);
};


// Check Date
const dateIsValid = (value) => {
    return !value || !Number.isNaN(new Date(value).getTime());
};


// Show Dashboard
const showDashboard = async (req, res, next) => {
    try {
        const { q = "", status = "" } = req.query;

        // Find Accessible Projects
        const filter = {
            $or: [
                { owner: req.user._id },
                { members: req.user._id },
            ],
        };

        // Filter by Project Status
        if (status && validProjectStatus.includes(status)) {
            filter.status = status;
        }

        // Search Projects
        if (q.trim()) {
            filter.$and = [
                {
                    name: {
                        $regex: q.trim(),
                        $options: "i",
                    },
                },
            ];
        }

        // Get Projects and Project IDs
        const [
            projects,
            accessibleProjectIds,
        ] = await Promise.all([
            Project.find(filter)
                .populate("owner", "name email")
                .sort({ updatedAt: -1 }),

            Project.find({
                $or: [
                    { owner: req.user._id },
                    { members: req.user._id },
                ],
            }).distinct("_id"),
        ]);

        // Get Task Statistics
        const taskStats = await Task.aggregate([
            {
                $match: {
                    project: {
                        $in: accessibleProjectIds,
                    },
                    status: {
                        $in: validTaskStatus,
                    },
                },
            },
            {
                $group: {
                    _id: "$status",
                    count: {
                        $sum: 1,
                    },
                },
            },
        ]);

        // Set Default Counts
        const counts = {
            todo: 0,
            "in-progress": 0,
            completed: 0,
        };

        taskStats.forEach(({ _id, count }) => {
            counts[_id] = count;
        });

        // Render Dashboard
        res.render("dashboard", {
            title: "Dashboard",
            user: req.user,
            projects,
            filters: {
                q,
                status,
            },
            counts,
        });

    } catch (error) {
        next(error);
    }
};


// Show Create Project Page
const showCreateProject = (req, res) => {
    res.render("projects/create", {
        title: "Create project",
    });
};


// Create Project
const createProject = async (req, res, next) => {
    try {
        const {
            name,
            description,
            startDate,
            dueDate,
        } = req.body;

        // Validate Project Name
        if (!name?.trim()) {
            return fail(
                req,
                res,
                "/projects/create",
                "Project name is required."
            );
        }

        // Validate Dates
        if (
            !dateIsValid(startDate) ||
            !dateIsValid(dueDate) ||
            (
                startDate &&
                dueDate &&
                new Date(dueDate) < new Date(startDate)
            )
        ) {
            return fail(
                req,
                res,
                "/projects/create",
                "Use valid dates, with the due date on or after the start date."
            );
        }

        // Create Project
        const project = await Project.create({
            name: name.trim(),
            description: description?.trim(),
            startDate: startDate || null,
            dueDate: dueDate || null,
            owner: req.user._id,
            members: [req.user._id],
        });

        req.flash(
            "success",
            "Project created. Add teammates when you are ready."
        );

        res.redirect(`/projects/${project._id}`);

    } catch (error) {
        next(error);
    }
};


// Show Project
const showProject = async (req, res, next) => {
    try {

        // Validate Project ID
        if (!isValidId(req.params.id)) {
            return res.status(404).render("error", {
                title: "Project not found",
                status: 404,
                message: "This project does not exist.",
            });
        }

        // Find Project
        const project = await Project.findById(req.params.id)
            .populate("owner", "name email")
            .populate("members", "name email");

        if (!project) {
            return res.status(404).render("error", {
                title: "Project not found",
                status: 404,
                message: "This project does not exist.",
            });
        }

        // Check Project Membership
        if (!isMember(project, req.user._id)) {
            return res.status(403).render("error", {
                title: "Access denied",
                status: 403,
                message: "You do not have access to this project.",
            });
        }

        const {
            q = "",
            taskStatus = "",
            priority = "",
        } = req.query;

        const taskFilter = {
            project: project._id,
        };

        // Search Tasks
        if (q.trim()) {
            taskFilter.title = {
                $regex: q.trim(),
                $options: "i",
            };
        }

        // Filter by Status
        if (validTaskStatus.includes(taskStatus)) {
            taskFilter.status = taskStatus;
        }

        // Filter by Priority
        if (validPriority.includes(priority)) {
            taskFilter.priority = priority;
        }

        // Get Tasks
        const tasks = await Task.find(taskFilter)
            .populate("assignedTo", "name email")
            .sort({
                dueDate: 1,
                createdAt: -1,
            });

        // Render Project
        res.render("projects/show", {
            title: project.name,
            project,
            user: req.user,
            tasks,
            filters: {
                q,
                taskStatus,
                priority,
            },
            canManage: isOwner(project, req.user._id),
        });

    } catch (error) {
        next(error);
    }
};


// Show Edit Project Page
const showEditProject = async (req, res, next) => {
    try {

        // Find Project
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).render("error", {
                title: "Project not found",
                status: 404,
                message: "This project does not exist.",
            });
        }

        // Check Owner Permission
        if (!isOwner(project, req.user._id)) {
            return res.status(403).render("error", {
                title: "Access denied",
                status: 403,
                message: "Only the project owner can edit this project.",
            });
        }

        res.render("projects/edit", {
            title: `Edit ${project.name}`,
            project,
        });

    } catch (error) {
        next(error);
    }
};


// Update Project
const updateProject = async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.id);

        // Check Project
        if (!project) {
            return fail(
                req,
                res,
                "/dashboard",
                "Project not found."
            );
        }

        // Check Owner Permission
        if (!isOwner(project, req.user._id)) {
            return fail(
                req,
                res,
                `/projects/${project._id}`,
                "Only the project owner can update it."
            );
        }

        const {
            name,
            description,
            status,
            startDate,
            dueDate,
        } = req.body;

        // Validate Project
        if (
            !name?.trim() ||
            !validProjectStatus.includes(status)
        ) {
            return fail(
                req,
                res,
                `/projects/${project._id}/edit`,
                "Enter a project name and valid status."
            );
        }

        // Validate Dates
        if (
            !dateIsValid(startDate) ||
            !dateIsValid(dueDate) ||
            (
                startDate &&
                dueDate &&
                new Date(dueDate) < new Date(startDate)
            )
        ) {
            return fail(
                req,
                res,
                `/projects/${project._id}/edit`,
                "Use valid project dates."
            );
        }

        // Update Project
        Object.assign(project, {
            name: name.trim(),
            description: description?.trim(),
            status,
            startDate: startDate || null,
            dueDate: dueDate || null,
        });

        await project.save();

        req.flash("success", "Project updated.");

        res.redirect(`/projects/${project._id}`);

    } catch (error) {
        next(error);
    }
};


// Delete Project
const deleteProject = async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.id);

        // Check Project
        if (!project) {
            return fail(
                req,
                res,
                "/dashboard",
                "Project not found."
            );
        }

        // Check Owner Permission
        if (!isOwner(project, req.user._id)) {
            return fail(
                req,
                res,
                `/projects/${project._id}`,
                "Only the project owner can delete it."
            );
        }

        // Find Project Tasks
        const tasks = await Task.find({
            project: project._id,
        }).select("_id");

        // Delete Comments
        await Comment.deleteMany({
            task: {
                $in: tasks.map(task => task._id),
            },
        });

        // Delete Tasks
        await Task.deleteMany({
            project: project._id,
        });

        // Delete Project
        await Project.deleteOne({
            _id: project._id,
        });

        req.flash(
            "success",
            "Project and its tasks were deleted."
        );

        res.redirect("/dashboard");

    } catch (error) {
        next(error);
    }
};


// Show Project Members
const showMembers = async (req, res, next) => {
    try {

        // Check Project Access
        const result = await findAccessibleProject(
            req.params.id,
            req.user._id
        );

        if (result.error) {
            return res.status(result.status).render("error", {
                title: result.error,
                status: result.status,
                message: result.error,
            });
        }

        // Get Project Members
        const project = await result.project.populate([
            {
                path: "owner",
                select: "name email",
            },
            {
                path: "members",
                select: "name email",
            },
        ]);

        // Render Members Page
        res.render("projects/members", {
            title: `Members · ${project.name}`,
            project,
            canManage: isOwner(project, req.user._id),
        });

    } catch (error) {
        next(error);
    }
};


// Add Project Member
const addMember = async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.id);

        // Check Project
        if (!project) {
            return fail(
                req,
                res,
                "/dashboard",
                "Project not found."
            );
        }

        // Check Owner Permission
        if (!isOwner(project, req.user._id)) {
            return fail(
                req,
                res,
                `/projects/${project._id}`,
                "Only the project owner can manage members."
            );
        }

        const email = req.body.email?.trim().toLowerCase();

        // Validate Email
        if (!email) {
            return fail(
                req,
                res,
                `/projects/${project._id}/members`,
                "Enter a teammate's email."
            );
        }

        // Find User
        const user = await User.findOne({
            email,
        });

        if (!user) {
            return fail(
                req,
                res,
                `/projects/${project._id}/members`,
                "No account was found with that email. Ask them to register first."
            );
        }

        // Check Existing Member
        if (
            project.members.some(member =>
                member.equals(user._id)
            )
        ) {
            return fail(
                req,
                res,
                `/projects/${project._id}/members`,
                "That person is already a project member."
            );
        }

        // Add Member
        project.members.push(user._id);

        await project.save();

        req.flash(
            "success",
            `${user.name} was added to the project.`
        );

        res.redirect(
            `/projects/${project._id}/members`
        );

    } catch (error) {
        next(error);
    }
};


// Remove Project Member
const removeMember = async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.id);

        // Check Project
        if (!project) {
            return fail(
                req,
                res,
                "/dashboard",
                "Project not found."
            );
        }

        // Check Owner Permission
        if (!isOwner(project, req.user._id)) {
            return fail(
                req,
                res,
                `/projects/${project._id}`,
                "Only the project owner can manage members."
            );
        }

        // Validate Member ID
        if (
            !isValidId(req.params.userId) ||
            project.owner.equals(req.params.userId)
        ) {
            return fail(
                req,
                res,
                `/projects/${project._id}/members`,
                "The project owner cannot be removed."
            );
        }

        // Check Project Membership
        if (
            !project.members.some(member =>
                member.equals(req.params.userId)
            )
        ) {
            return fail(
                req,
                res,
                `/projects/${project._id}/members`,
                "That user is not a project member."
            );
        }

        // Remove Member
        project.members = project.members.filter(
            member => !member.equals(req.params.userId)
        );

        // Unassign Member's Tasks
        await Task.updateMany(
            {
                project: project._id,
                assignedTo: req.params.userId,
            },
            {
                $set: {
                    assignedTo: null,
                },
            }
        );

        await project.save();

        req.flash(
            "success",
            "Member removed and their assigned tasks were unassigned."
        );

        res.redirect(
            `/projects/${project._id}/members`
        );

    } catch (error) {
        next(error);
    }
};


module.exports = {
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
};