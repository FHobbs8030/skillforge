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

  const allowedStatuses = new Set([
    "backlog",
    "todo",
    "in_progress",
    "review",
    "completed",
  ]);

  if (!allowedStatuses.has(status)) {
    validationErrors.status =
      "Task status must be backlog, todo, in progress, review, or completed.";
  }

  const allowedPriorities = new Set(["low", "medium", "high", "urgent"]);

  if (!allowedPriorities.has(priority)) {
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
