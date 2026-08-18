const Comment = require("../models/Comment");
const Task = require("../models/Task");

const {
    isValidId,
    isOwner,
    findAccessibleProject,
} = require("../utils/access");


// Add Comment
const addComment = async (req, res, next) => {
    try {

        // Validate Task ID
        if (!isValidId(req.params.taskId)) {
            req.flash("error", "Task not found.");
            return res.redirect("/dashboard");
        }

        // Find Task
        const task = await Task.findById(req.params.taskId)
            .populate("project", "owner members");

        if (!task) {
            req.flash("error", "Task not found.");
            return res.redirect("/dashboard");
        }

        // Check Project Access
        const access = await findAccessibleProject(
            task.project._id,
            req.user._id
        );

        if (access.error) {
            return res.status(access.status).render("error", {
                title: access.error,
                status: access.status,
                message: access.error,
            });
        }

        // Get Comment Text
        const text = req.body.text?.trim();

        // Validate Comment
        if (!text || text.length > 2000) {
            req.flash(
                "error",
                "A comment must be between 1 and 2,000 characters."
            );

            return res.redirect(`/tasks/${task._id}`);
        }

        // Create Comment
        await Comment.create({
            text,
            task: task._id,
            author: req.user._id,
        });

        req.flash("success", "Comment added.");

        res.redirect(`/tasks/${task._id}#comments`);

    } catch (error) {
        next(error);
    }
};


// Delete Comment
const deleteComment = async (req, res, next) => {
    try {

        // Validate Comment ID
        if (!isValidId(req.params.id)) {
            req.flash("error", "Comment not found.");
            return res.redirect("/dashboard");
        }

        // Find Comment
        const comment = await Comment.findById(req.params.id)
            .populate({
                path: "task",
                populate: {
                    path: "project",
                    select: "owner members",
                },
            });

        if (!comment || !comment.task) {
            req.flash("error", "Comment not found.");
            return res.redirect("/dashboard");
        }

        // Check Project Access
        const access = await findAccessibleProject(
            comment.task.project._id,
            req.user._id
        );

        if (access.error) {
            return res.status(access.status).render("error", {
                title: access.error,
                status: access.status,
                message: access.error,
            });
        }

        // Check Delete Permission
        const isAuthor = comment.author.equals(req.user._id);
        const isProjectOwner = isOwner(
            comment.task.project,
            req.user._id
        );

        if (!isAuthor && !isProjectOwner) {
            req.flash(
                "error",
                "Only the comment author or project owner can delete it."
            );

            return res.redirect(
                `/tasks/${comment.task._id}#comments`
            );
        }

        // Delete Comment
        const taskId = comment.task._id;

        await Comment.deleteOne({
            _id: comment._id,
        });

        req.flash("success", "Comment deleted.");

        res.redirect(`/tasks/${taskId}#comments`);

    } catch (error) {
        next(error);
    }
};


module.exports = {
    addComment,
    deleteComment,
};