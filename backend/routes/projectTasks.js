const express = require("express");
const mongoose = require("mongoose");

const ActivityEvent = require("../models/ActivityEvent");
const Project = require("../models/Project");
const ProjectMembership = require("../models/ProjectMembership");
const ProjectTask = require("../models/ProjectTask");

const requireAuth = require("../middleware/auth");

const router = express.Router({
  mergeParams: true,
});

const TASK_CREATE_ROLES = new Set(["owner", "host"]);
const TASK_MANAGE_ROLES = new Set(["owner", "host"]);

const TASK_STATUSES = new Set([
  "backlog",
  "todo",
  "in_progress",
  "review",
  "completed",
  "archived",
]);

const TASK_ACTIVE_STATUSES = new Set([
  "backlog",
  "todo",
  "in_progress",
  "review",
  "completed",
]);

const COLLABORATOR_TASK_STATUSES = new Set([
  "todo",
  "in_progress",
  "review",
  "completed",
]);

const TASK_PRIORITIES = new Set(["low", "medium", "high", "urgent"]);

const TASK_UPDATE_FIELDS = new Set([
  "title",
  "description",
  "status",
  "priority",
  "assigneeId",
  "labels",
  "dueDate",
]);

function getMongooseValidationFields(error) {
  return Object.fromEntries(
    Object.entries(error.errors).map(([fieldName, fieldError]) => [
      fieldName,
      fieldError.message,
    ]),
  );
}

router.get("/", requireAuth, async (req, res) => {
  const { projectId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    return res.status(400).json({
      error: "Invalid project ID.",
    });
  }

  try {
    const membership = await ProjectMembership.findOne({
      projectId,
      userId: req.user._id,
      status: "active",
    }).lean();

    if (!membership) {
      return res.status(404).json({
        error: "Project not found.",
      });
    }

    const project = await Project.findById(projectId).lean();

    if (!project) {
      return res.status(404).json({
        error: "Project not found.",
      });
    }

    const tasks = await ProjectTask.find({
      projectId,
    })
      .populate({
        path: "assigneeId",
        select: "fullName email",
      })
      .populate({
        path: "createdById",
        select: "fullName email",
      })
      .sort({
        status: 1,
        position: 1,
        updatedAt: -1,
      })
      .lean();

    return res.status(200).json({
      project: {
        id: project._id,
        name: project.name,
        status: project.status,
      },
      membership: {
        role: membership.role,
        status: membership.status,
      },
      tasks,
    });
  } catch (error) {
    console.error("Project task list route error:", error);

    return res.status(500).json({
      error: "Unable to load project tasks. Please try again.",
    });
  }
});

router.get("/:taskId", requireAuth, async (req, res) => {
  const { projectId, taskId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    return res.status(400).json({
      error: "Invalid project ID.",
    });
  }

  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    return res.status(400).json({
      error: "Invalid task ID.",
    });
  }

  try {
    const membership = await ProjectMembership.findOne({
      projectId,
      userId: req.user._id,
      status: "active",
    }).lean();

    if (!membership) {
      return res.status(404).json({
        error: "Project not found.",
      });
    }

    const project = await Project.findById(projectId).lean();

    if (!project) {
      return res.status(404).json({
        error: "Project not found.",
      });
    }

    const task = await ProjectTask.findOne({
      _id: taskId,
      projectId,
    })
      .populate({
        path: "assigneeId",
        select: "fullName email",
      })
      .populate({
        path: "createdById",
        select: "fullName email",
      })
      .lean();

    if (!task) {
      return res.status(404).json({
        error: "Task not found.",
      });
    }

    return res.status(200).json({
      project: {
        id: project._id,
        name: project.name,
        status: project.status,
      },
      membership: {
        role: membership.role,
        status: membership.status,
      },
      task,
    });
  } catch (error) {
    console.error("Project task detail route error:", error);

    return res.status(500).json({
      error: "Unable to load the project task. Please try again.",
    });
  }
});

router.patch("/:taskId", requireAuth, async (req, res) => {
  const { projectId, taskId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    return res.status(400).json({
      error: "Invalid project ID.",
    });
  }

  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    return res.status(400).json({
      error: "Invalid task ID.",
    });
  }

  const requestBody = req.body && typeof req.body === "object" ? req.body : {};

  const requestedFields = Object.keys(requestBody);

  if (requestedFields.length === 0) {
    return res.status(400).json({
      error: "At least one task field must be provided.",
    });
  }

  const unsupportedFields = requestedFields.filter(
    (fieldName) => !TASK_UPDATE_FIELDS.has(fieldName),
  );

  if (unsupportedFields.length > 0) {
    return res.status(400).json({
      error: "Validation failed.",
      fields: {
        request: `Unsupported task fields: ${unsupportedFields.join(", ")}.`,
      },
    });
  }

  const updates = {};
  const validationErrors = {};

  if (Object.prototype.hasOwnProperty.call(requestBody, "title")) {
    if (typeof requestBody.title !== "string") {
      validationErrors.title = "Task title must be a string.";
    } else {
      const title = requestBody.title.trim();

      if (title.length < 2) {
        validationErrors.title =
          "Task title must contain at least 2 characters.";
      } else if (title.length > 160) {
        validationErrors.title = "Task title cannot exceed 160 characters.";
      } else {
        updates.title = title;
      }
    }
  }

  if (Object.prototype.hasOwnProperty.call(requestBody, "description")) {
    if (typeof requestBody.description !== "string") {
      validationErrors.description = "Task description must be a string.";
    } else {
      const description = requestBody.description.trim();

      if (description.length > 4000) {
        validationErrors.description =
          "Task description cannot exceed 4000 characters.";
      } else {
        updates.description = description;
      }
    }
  }

  if (Object.prototype.hasOwnProperty.call(requestBody, "status")) {
    if (typeof requestBody.status !== "string") {
      validationErrors.status = "Task status must be a string.";
    } else {
      const status = requestBody.status.trim().toLowerCase();

      if (!TASK_STATUSES.has(status)) {
        validationErrors.status =
          "Task status must be backlog, todo, in progress, review, completed, or archived.";
      } else {
        updates.status = status;
      }
    }
  }

  if (Object.prototype.hasOwnProperty.call(requestBody, "priority")) {
    if (typeof requestBody.priority !== "string") {
      validationErrors.priority = "Task priority must be a string.";
    } else {
      const priority = requestBody.priority.trim().toLowerCase();

      if (!TASK_PRIORITIES.has(priority)) {
        validationErrors.priority =
          "Task priority must be low, medium, high, or urgent.";
      } else {
        updates.priority = priority;
      }
    }
  }

  if (Object.prototype.hasOwnProperty.call(requestBody, "assigneeId")) {
    if (requestBody.assigneeId === null || requestBody.assigneeId === "") {
      updates.assigneeId = null;
    } else if (!mongoose.Types.ObjectId.isValid(requestBody.assigneeId)) {
      validationErrors.assigneeId = "Invalid task assignee ID.";
    } else {
      updates.assigneeId = requestBody.assigneeId;
    }
  }

  if (Object.prototype.hasOwnProperty.call(requestBody, "dueDate")) {
    if (requestBody.dueDate === null || requestBody.dueDate === "") {
      updates.dueDate = null;
    } else {
      const dueDate = new Date(requestBody.dueDate);

      if (Number.isNaN(dueDate.getTime())) {
        validationErrors.dueDate = "Enter a valid task due date.";
      } else {
        updates.dueDate = dueDate;
      }
    }
  }

  if (Object.prototype.hasOwnProperty.call(requestBody, "labels")) {
    if (!Array.isArray(requestBody.labels)) {
      validationErrors.labels = "Task labels must be an array.";
    } else if (requestBody.labels.length > 10) {
      validationErrors.labels = "A task cannot have more than 10 labels.";
    } else {
      let labels = requestBody.labels
        .filter((label) => typeof label === "string")
        .map((label) => label.trim())
        .filter(Boolean);

      if (labels.some((label) => label.length > 40)) {
        validationErrors.labels = "Task labels cannot exceed 40 characters.";
      } else {
        labels = [...new Set(labels)];
        updates.labels = labels;
      }
    }
  }

  if (Object.keys(validationErrors).length > 0) {
    return res.status(400).json({
      error: "Validation failed.",
      fields: validationErrors,
    });
  }

  try {
    const membership = await ProjectMembership.findOne({
      projectId,
      userId: req.user._id,
      status: "active",
    }).lean();

    if (!membership) {
      return res.status(404).json({
        error: "Project not found.",
      });
    }

    const project = await Project.findById(projectId).lean();

    if (!project) {
      return res.status(404).json({
        error: "Project not found.",
      });
    }

    if (project.status === "archived") {
      return res.status(409).json({
        error: "Tasks cannot be modified in an archived project.",
      });
    }

    const task = await ProjectTask.findOne({
      _id: taskId,
      projectId,
    });

    if (!task) {
      return res.status(404).json({
        error: "Task not found.",
      });
    }

    const canManageTask = TASK_MANAGE_ROLES.has(membership.role);
    const isCollaborator = membership.role === "collaborator";

    if (!canManageTask && !isCollaborator) {
      return res.status(403).json({
        error: "You do not have permission to modify project tasks.",
      });
    }

    if (isCollaborator) {
      const collaboratorRequestedInvalidField = requestedFields.some(
        (fieldName) => fieldName !== "status",
      );

      if (collaboratorRequestedInvalidField) {
        return res.status(403).json({
          error: "Collaborators can only update the status of assigned tasks.",
        });
      }

      if (
        !task.assigneeId ||
        task.assigneeId.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({
          error: "Collaborators can only update tasks assigned to them.",
        });
      }

      if (task.status === "archived") {
        return res.status(409).json({
          error: "Archived tasks cannot be updated by collaborators.",
        });
      }

      if (!COLLABORATOR_TASK_STATUSES.has(updates.status)) {
        return res.status(403).json({
          error:
            "Collaborators can only move assigned tasks between todo, in progress, review, and completed.",
        });
      }
    }

    if (
      Object.prototype.hasOwnProperty.call(updates, "assigneeId") &&
      updates.assigneeId
    ) {
      const assigneeMembership = await ProjectMembership.findOne({
        projectId,
        userId: updates.assigneeId,
        status: "active",
        role: {
          $in: ["owner", "host", "collaborator"],
        },
      }).lean();

      if (!assigneeMembership) {
        return res.status(400).json({
          error: "Validation failed.",
          fields: {
            assigneeId:
              "The task assignee must be an active project contributor.",
          },
        });
      }
    }

    const previousStatus = task.status;
    const previousAssigneeId = task.assigneeId
      ? task.assigneeId.toString()
      : null;

    const statusChanged =
      Object.prototype.hasOwnProperty.call(updates, "status") &&
      updates.status !== previousStatus;

    if (statusChanged) {
      const lastTask = await ProjectTask.findOne({
        projectId,
        status: updates.status,
        _id: {
          $ne: task._id,
        },
      })
        .sort({
          position: -1,
        })
        .select("position")
        .lean();

      task.position = lastTask ? lastTask.position + 1 : 0;

      if (updates.status === "completed" && previousStatus !== "completed") {
        task.completedAt = new Date();
      } else if (
        previousStatus === "completed" &&
        updates.status !== "completed"
      ) {
        task.completedAt = null;
      }

      if (updates.status === "archived") {
        task.archivedAt = new Date();
      } else if (previousStatus === "archived") {
        task.archivedAt = null;
      }
    }

    for (const [fieldName, fieldValue] of Object.entries(updates)) {
      task[fieldName] = fieldValue;
    }

    await task.save();

    const currentAssigneeId = task.assigneeId
      ? task.assigneeId.toString()
      : null;

    const assigneeChanged = previousAssigneeId !== currentAssigneeId;

    let eventType = "task_updated";

    if (statusChanged && task.status === "archived") {
      eventType = "task_archived";
    } else if (
      statusChanged &&
      previousStatus === "completed" &&
      task.status !== "completed"
    ) {
      eventType = "task_reopened";
    } else if (
      statusChanged &&
      previousStatus !== "completed" &&
      task.status === "completed"
    ) {
      eventType = "task_completed";
    } else if (statusChanged) {
      eventType = "task_status_changed";
    } else if (assigneeChanged && currentAssigneeId) {
      eventType = "task_assigned";
    } else if (assigneeChanged) {
      eventType = "task_unassigned";
    }

    const activityEvent = await ActivityEvent.create({
      projectId,
      actorId: req.user._id,
      eventType,
      source: "skillforge",
      entityType: "project_task",
      entityId: task._id.toString(),
      metadata: {
        taskId: task._id,
        title: task.title,
        changedFields: requestedFields,
        previousStatus,
        status: task.status,
        previousAssigneeId,
        assigneeId: task.assigneeId,
      },
      occurredAt: new Date(),
    });

    await task.populate([
      {
        path: "assigneeId",
        select: "fullName email",
      },
      {
        path: "createdById",
        select: "fullName email",
      },
    ]);

    return res.status(200).json({
      message: "Task updated successfully.",
      task,
      activityEvent,
    });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        error: "Validation failed.",
        fields: getMongooseValidationFields(error),
      });
    }

    console.error("Project task update route error:", error);

    return res.status(500).json({
      error: "Unable to update the task. Please try again.",
    });
  }
});

router.post("/", requireAuth, async (req, res) => {
  const { projectId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    return res.status(400).json({
      error: "Invalid project ID.",
    });
  }

  const title =
    typeof req.body?.title === "string" ? req.body.title.trim() : "";

  const description =
    typeof req.body?.description === "string"
      ? req.body.description.trim()
      : "";

  const status =
    typeof req.body?.status === "string"
      ? req.body.status.trim().toLowerCase()
      : "backlog";

  const priority =
    typeof req.body?.priority === "string"
      ? req.body.priority.trim().toLowerCase()
      : "medium";

  const validationErrors = {};

  if (title.length < 2) {
    validationErrors.title = "Task title must contain at least 2 characters.";
  } else if (title.length > 160) {
    validationErrors.title = "Task title cannot exceed 160 characters.";
  }

  if (description.length > 4000) {
    validationErrors.description =
      "Task description cannot exceed 4000 characters.";
  }

  if (!TASK_ACTIVE_STATUSES.has(status)) {
    validationErrors.status =
      "Task status must be backlog, todo, in progress, review, or completed.";
  }

  if (!TASK_PRIORITIES.has(priority)) {
    validationErrors.priority =
      "Task priority must be low, medium, high, or urgent.";
  }

  let assigneeId = null;

  if (req.body?.assigneeId) {
    if (!mongoose.Types.ObjectId.isValid(req.body.assigneeId)) {
      validationErrors.assigneeId = "Invalid task assignee ID.";
    } else {
      assigneeId = req.body.assigneeId;
    }
  }

  let dueDate = null;

  if (req.body?.dueDate) {
    dueDate = new Date(req.body.dueDate);

    if (Number.isNaN(dueDate.getTime())) {
      validationErrors.dueDate = "Enter a valid task due date.";
    }
  }

  let labels = [];

  if (req.body?.labels !== undefined) {
    if (!Array.isArray(req.body.labels)) {
      validationErrors.labels = "Task labels must be an array.";
    } else if (req.body.labels.length > 10) {
      validationErrors.labels = "A task cannot have more than 10 labels.";
    } else {
      labels = req.body.labels
        .filter((label) => typeof label === "string")
        .map((label) => label.trim())
        .filter(Boolean);

      if (labels.some((label) => label.length > 40)) {
        validationErrors.labels =
          "Task labels cannot exceed 40 characters.";
      }

      labels = [...new Set(labels)];
    }
  }

  if (Object.keys(validationErrors).length > 0) {
    return res.status(400).json({
      error: "Validation failed.",
      fields: validationErrors,
    });
  }

  try {
    const membership = await ProjectMembership.findOne({
      projectId,
      userId: req.user._id,
      status: "active",
    }).lean();

    if (!membership) {
      return res.status(404).json({
        error: "Project not found.",
      });
    }

    if (!TASK_CREATE_ROLES.has(membership.role)) {
      return res.status(403).json({
        error: "Only project owners and hosts can create tasks.",
      });
    }

    const project = await Project.findById(projectId).lean();

    if (!project) {
      return res.status(404).json({
        error: "Project not found.",
      });
    }

    if (project.status === "archived") {
      return res.status(409).json({
        error: "Tasks cannot be created in an archived project.",
      });
    }

    if (assigneeId) {
      const assigneeMembership = await ProjectMembership.findOne({
        projectId,
        userId: assigneeId,
        status: "active",
        role: {
          $in: ["owner", "host", "collaborator"],
        },
      }).lean();

      if (!assigneeMembership) {
        return res.status(400).json({
          error: "Validation failed.",
          fields: {
            assigneeId:
              "The task assignee must be an active project contributor.",
          },
        });
      }
    }

    const lastTask = await ProjectTask.findOne({
      projectId,
      status,
    })
      .sort({
        position: -1,
      })
      .select("position")
      .lean();

    const task = await ProjectTask.create({
      projectId,
      title,
      description,
      status,
      priority,
      assigneeId,
      createdById: req.user._id,
      labels,
      dueDate,
      position: lastTask ? lastTask.position + 1 : 0,
      completedAt: status === "completed" ? new Date() : null,
    });

    const activityEvent = await ActivityEvent.create({
      projectId,
      actorId: req.user._id,
      eventType: "task_created",
      source: "skillforge",
      entityType: "project_task",
      entityId: task._id.toString(),
      metadata: {
        taskId: task._id,
        title: task.title,
        status: task.status,
        priority: task.priority,
        assigneeId: task.assigneeId,
      },
      occurredAt: new Date(),
    });

    await task.populate([
      {
        path: "assigneeId",
        select: "fullName email",
      },
      {
        path: "createdById",
        select: "fullName email",
      },
    ]);

    return res.status(201).json({
      message: "Task created successfully.",
      task,
      activityEvent,
    });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        error: "Validation failed.",
        fields: getMongooseValidationFields(error),
      });
    }

    console.error("Project task creation route error:", error);

    return res.status(500).json({
      error: "Unable to create the task. Please try again.",
    });
  }
});

module.exports = router;
