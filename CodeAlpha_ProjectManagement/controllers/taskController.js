const Task = require("../models/Task");
const Comment = require("../models/Comment");

const {
    isValidId,
    isOwner,
    isMember,
    findAccessibleProject,
} = require("../utils/access");


const statuses = [
    "todo",
    "in-progress",
    "completed",
];

const priorities = [
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
const validDate = (value) => {
    return !value || !Number.isNaN(new Date(value).getTime());
};


// Find Accessible Project
const projectForTask = async (projectId, userId) => {
    return findAccessibleProject(projectId, userId);
};


// Check Task Assignee
const validAssignee = (project, assignedTo) => {
    return (
        !assignedTo ||
        (isValidId(assignedTo) && isMember(project, assignedTo))
    );
};


// Show Create Task Page
const showCreateTask = async (req, res, next) => {
    try {
        const result = await projectForTask(
            req.params.projectId,
            req.user._id
        );

        // Check Project Access
        if (result.error) {
            return res.status(result.status).render("error", {
                title: result.error,
                status: result.status,
                message: result.error,
            });
        }

        // Get Project Members
        const project = await result.project.populate(
            "members",
            "name email"
        );

        // Render Create Task Page
        res.render("tasks/create", {
            title: "Create task",
            project,
        });

    } catch (error) {
        next(error);
    }
};


// Create Task
const createTask = async (req, res, next) => {
    try {
        const result = await projectForTask(
            req.params.projectId,
            req.user._id
        );

        // Check Project Access
        if (result.error) {
            return fail(
                req,
                res,
                "/dashboard",
                result.error
            );
        }

        const project = result.project;

        const {
            title,
            description,
            assignedTo,
            status,
            priority,
            dueDate,
        } = req.body;

        // Validate Task Details
        if (
            !title?.trim() ||
            !statuses.includes(status) ||
            !priorities.includes(priority) ||
            !validDate(dueDate)
        ) {
            return fail(
                req,
                res,
                `/projects/${project._id}/tasks/create`,
                "Complete the task title and choose valid task details."
            );
        }

        // Validate Assignee
        if (!validAssignee(project, assignedTo)) {
            return fail(
                req,
                res,
                `/projects/${project._id}/tasks/create`,
                "Tasks can only be assigned to project members."
            );
        }

        // Create Task
        const task = await Task.create({
            title: title.trim(),
            description: description?.trim(),
            project: project._id,
            assignedTo: assignedTo || null,
            createdBy: req.user._id,
            status,
            priority,
            dueDate: dueDate || null,
        });

        req.flash("success", "Task created.");

        res.redirect(`/tasks/${task._id}`);

    } catch (error) {
        next(error);
    }
};


// Load Task
const loadTask = async (id) => {
    if (!isValidId(id)) {
        return null;
    }

    return Task.findById(id)
        .populate("project", "name owner members")
        .populate("assignedTo", "name email")
        .populate("createdBy", "name email");
};


// Show Task
const showTask = async (req, res, next) => {
    try {
        const task = await loadTask(req.params.id);

        // Check Task
        if (!task) {
            return res.status(404).render("error", {
                title: "Task not found",
                status: 404,
                message: "This task does not exist.",
            });
        }

        // Check Project Access
        const result = await projectForTask(
            task.project._id,
            req.user._id
        );

        if (result.error) {
            return res.status(result.status).render("error", {
                title: result.error,
                status: result.status,
                message: result.error,
            });
        }

        // Get Comments
        const comments = await Comment.find({
            task: task._id,
        })
            .populate("author", "name email")
            .sort({ createdAt: 1 });

        // Check Edit Permission
        const isTaskCreator = task.createdBy._id.equals(
            req.user._id
        );

        const isProjectOwner = isOwner(
            task.project,
            req.user._id
        );

        const canEdit = isProjectOwner || isTaskCreator;

        // Render Task
        res.render("tasks/show", {
            title: task.title,
            task,
            comments,
            canEdit,
            canManage: isProjectOwner,
        });

    } catch (error) {
        next(error);
    }
};


// Show Edit Task Page
const showEditTask = async (req, res, next) => {
    try {
        const task = await loadTask(req.params.id);

        // Check Task
        if (!task) {
            return res.status(404).render("error", {
                title: "Task not found",
                status: 404,
                message: "This task does not exist.",
            });
        }

        // Check Project Access
        const result = await projectForTask(
            task.project._id,
            req.user._id
        );

        if (result.error) {
            return res.status(result.status).render("error", {
                title: result.error,
                status: result.status,
                message: result.error,
            });
        }

        // Check Edit Permission
        const isTaskCreator = task.createdBy._id.equals(
            req.user._id
        );

        const isProjectOwner = isOwner(
            task.project,
            req.user._id
        );

        if (!isProjectOwner && !isTaskCreator) {
            return res.status(403).render("error", {
                title: "Access denied",
                status: 403,
                message: "Only the task creator or project owner can edit this task.",
            });
        }

        // Get Project Members
        const project = await result.project.populate(
            "members",
            "name email"
        );

        // Render Edit Task Page
        res.render("tasks/edit", {
            title: `Edit ${task.title}`,
            task,
            project,
        });

    } catch (error) {
        next(error);
    }
};


// Update Task
const updateTask = async (req, res, next) => {
    try {
        const task = await loadTask(req.params.id);

        // Check Task
        if (!task) {
            return fail(
                req,
                res,
                "/dashboard",
                "Task not found."
            );
        }

        // Check Project Access
        const result = await projectForTask(
            task.project._id,
            req.user._id
        );

        if (result.error) {
            return fail(
                req,
                res,
                "/dashboard",
                result.error
            );
        }

        // Check Edit Permission
        const isTaskCreator = task.createdBy._id.equals(
            req.user._id
        );

        const isProjectOwner = isOwner(
            task.project,
            req.user._id
        );

        if (!isProjectOwner && !isTaskCreator) {
            return fail(
                req,
                res,
                `/tasks/${task._id}`,
                "Only the task creator or project owner can update it."
            );
        }

        const {
            title,
            description,
            assignedTo,
            status,
            priority,
            dueDate,
        } = req.body;

        // Validate Task Details
        if (
            !title?.trim() ||
            !statuses.includes(status) ||
            !priorities.includes(priority) ||
            !validDate(dueDate)
        ) {
            return fail(
                req,
                res,
                `/tasks/${task._id}/edit`,
                "Complete the task title and choose valid task details."
            );
        }

        // Validate Assignee
        if (!validAssignee(result.project, assignedTo)) {
            return fail(
                req,
                res,
                `/tasks/${task._id}/edit`,
                "Tasks can only be assigned to project members."
            );
        }

        // Update Task
        Object.assign(task, {
            title: title.trim(),
            description: description?.trim(),
            assignedTo: assignedTo || null,
            status,
            priority,
            dueDate: dueDate || null,
        });

        await task.save();

        req.flash("success", "Task updated.");

        res.redirect(`/tasks/${task._id}`);

    } catch (error) {
        next(error);
    }
};


// Delete Task
const deleteTask = async (req, res, next) => {
    try {
        const task = await loadTask(req.params.id);

        // Check Task
        if (!task) {
            return fail(
                req,
                res,
                "/dashboard",
                "Task not found."
            );
        }

        // Check Project Access
        const result = await projectForTask(
            task.project._id,
            req.user._id
        );

        if (result.error) {
            return fail(
                req,
                res,
                "/dashboard",
                result.error
            );
        }

        // Check Delete Permission
        const isTaskCreator = task.createdBy._id.equals(
            req.user._id
        );

        const isProjectOwner = isOwner(
            task.project,
            req.user._id
        );

        if (!isProjectOwner && !isTaskCreator) {
            return fail(
                req,
                res,
                `/tasks/${task._id}`,
                "Only the task creator or project owner can delete it."
            );
        }

        // Delete Task Comments
        await Comment.deleteMany({
            task: task._id,
        });

        // Delete Task
        await Task.deleteOne({
            _id: task._id,
        });

        req.flash("success", "Task deleted.");

        res.redirect(
            `/projects/${task.project._id}`
        );

    } catch (error) {
        next(error);
    }
};


module.exports = {
    showCreateTask,
    createTask,
    showTask,
    showEditTask,
    updateTask,
    deleteTask,
};