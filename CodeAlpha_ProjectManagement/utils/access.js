const mongoose = require("mongoose");
const Project = require("../models/Project");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const isOwner = (project, userId) => project.owner.equals(userId);

const isMember = (project, userId) =>
  isOwner(project, userId) ||
  project.members.some((member) => member.equals(userId));

const findAccessibleProject = async (id, userId) => {
  if (!isValidId(id)) return { error: "Project not found", status: 404 };

  const project = await Project.findById(id);
  
  if (!project) return { error: "Project not found", status: 404 };
  if (!isMember(project, userId))
    return { error: "You do not have access to this project", status: 403 };
  return { project };
};

module.exports = { isValidId, isOwner, isMember, findAccessibleProject };
