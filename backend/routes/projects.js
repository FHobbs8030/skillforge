const express = require("express");
const mongoose = require("mongoose");

const ActivityEvent = require("../models/ActivityEvent");
const Project = require("../models/Project");
const ProjectMembership = require("../models/ProjectMembership");

const requireAuth = require("../middleware/auth");

const router = express.Router();

const PROJECT_STATUSES = new Set([
  "planned",
  "active",
  "paused",
  "completed",
  "archived",
]);

const PROJECT_VISIBILITIES = new Set(["private", "team", "public"]);

function getMongooseValidationFields(error) {
  return Object.fromEntries(
    Object.entries(error.errors).map(([fieldName, fieldError]) => [
      fieldName,
      fieldError.message,
    ]),
  );
}

function normalizeRepository(repository) {
  if (!repository || typeof repository !== "object") {
    return undefined;
  }

  const provider =
    typeof repository.provider === "string"
      ? repository.provider.trim().toLowerCase()
      : "";

  const owner =
    typeof repository.owner === "string" ? repository.owner.trim() : "";

  const name =
    typeof repository.name === "string" ? repository.name.trim() : "";

  const url = typeof repository.url === "string" ? repository.url.trim() : "";

  if (!provider && !owner && !name && !url) {
    return undefined;
  }

  return {
    provider,
    owner,
    name,
    url,
  };
}

function validateRepository(repository) {
  const errors = {};

  if (!repository) {
    return errors;
  }

  if (repository.provider !== "github") {
    errors["repository.provider"] = "Repository provider must be GitHub.";
  }

  if (!repository.owner) {
    errors["repository.owner"] = "Repository owner is required.";
  } else if (repository.owner.length > 100) {
    errors["repository.owner"] =
      "Repository owner cannot exceed 100 characters.";
  }

  if (!repository.name) {
    errors["repository.name"] = "Repository name is required.";
  } else if (repository.name.length > 100) {
    errors["repository.name"] = "Repository name cannot exceed 100 characters.";
  }

  if (!repository.url) {
    errors["repository.url"] = "Repository URL is required.";
  } else {
    try {
      const repositoryUrl = new URL(repository.url);

      if (
        repositoryUrl.protocol !== "https:" ||
        repositoryUrl.hostname !== "github.com"
      ) {
        errors["repository.url"] =
          "Repository URL must be a valid GitHub HTTPS URL.";
      }
    } catch {
      errors["repository.url"] =
        "Repository URL must be a valid GitHub HTTPS URL.";
    }
  }

  return errors;
}

router.get("/", requireAuth, async (req, res) => {
  try {
    const memberships = await ProjectMembership.find({
      userId: req.user._id,
      status: "active",
    })
      .sort({
        updatedAt: -1,
      })
      .lean();

    if (memberships.length === 0) {
      return res.status(200).json({
        projects: [],
      });
    }

    const membershipByProjectId = new Map(
      memberships.map((membership) => [
        membership.projectId.toString(),
        membership,
      ]),
    );

    const projects = await Project.find({
      _id: {
        $in: memberships.map((membership) => membership.projectId),
      },
    })
      .sort({
        updatedAt: -1,
      })
      .lean();

    const projectResults = projects.map((project) => {
      const membership = membershipByProjectId.get(project._id.toString());

      return {
        ...project,
        membership: {
          role: membership.role,
          status: membership.status,
          joinedAt: membership.joinedAt,
        },
      };
    });

    return res.status(200).json({
      projects: projectResults,
    });
  } catch (error) {
    console.error("Project list route error:", error);

    return res.status(500).json({
      error: "Unable to load projects. Please try again.",
    });
  }
});

router.get("/:projectId", requireAuth, async (req, res) => {
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

    return res.status(200).json({
      project: {
        ...project,
        id: project._id,
        role: membership.role,
        repositoryUrl: project.repository?.url || "",
        membership: {
          role: membership.role,
          status: membership.status,
          joinedAt: membership.joinedAt,
        },
      },
    });
  } catch (error) {
    console.error("Project detail route error:", error);

    return res.status(500).json({
      error: "Unable to load project. Please try again.",
    });
  }
});

router.get("/:projectId/activity", requireAuth, async (req, res) => {
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

    const activityEvents = await ActivityEvent.find({
      projectId,
    })
      .sort({
        occurredAt: -1,
      })
      .limit(50)
      .lean();

    return res.status(200).json({
      activityEvents,
    });
  } catch (error) {
    console.error("Project activity route error:", error);

    return res.status(500).json({
      error: "Unable to load project activity. Please try again.",
    });
  }
});

router.post("/", requireAuth, async (req, res) => {
  const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";

  const description =
    typeof req.body?.description === "string"
      ? req.body.description.trim()
      : "";

  const status =
    typeof req.body?.status === "string"
      ? req.body.status.trim().toLowerCase()
      : "active";

  const visibility =
    typeof req.body?.visibility === "string"
      ? req.body.visibility.trim().toLowerCase()
      : "private";

  const repository = normalizeRepository(req.body?.repository);

  const validationErrors = {};

  if (name.length < 2) {
    validationErrors.name = "Project name must contain at least 2 characters.";
  } else if (name.length > 120) {
    validationErrors.name = "Project name cannot exceed 120 characters.";
  }

  if (description.length > 2000) {
    validationErrors.description =
      "Project description cannot exceed 2000 characters.";
  }

  if (!PROJECT_STATUSES.has(status)) {
    validationErrors.status =
      "Project status must be planned, active, paused, completed, or archived.";
  }

  if (!PROJECT_VISIBILITIES.has(visibility)) {
    validationErrors.visibility =
      "Project visibility must be private, team, or public.";
  }

  Object.assign(validationErrors, validateRepository(repository));

  if (Object.keys(validationErrors).length > 0) {
    return res.status(400).json({
      error: "Validation failed.",
      fields: validationErrors,
    });
  }

  const session = await mongoose.startSession();

  let createdProject;
  let createdMembership;
  let createdActivityEvent;

  try {
    await session.withTransaction(async () => {
      const projectDocuments = await Project.create(
        [
          {
            name,
            description,
            ownerId: req.user._id,
            status,
            visibility,
            repository,
          },
        ],
        {
          session,
        },
      );

      createdProject = projectDocuments[0];

      const membershipDocuments = await ProjectMembership.create(
        [
          {
            projectId: createdProject._id,
            userId: req.user._id,
            role: "owner",
            status: "active",
            joinedAt: new Date(),
          },
        ],
        {
          session,
        },
      );

      createdMembership = membershipDocuments[0];

      const activityDocuments = await ActivityEvent.create(
        [
          {
            projectId: createdProject._id,
            actorId: req.user._id,
            eventType: "project_created",
            source: "skillforge",
            entityType: "project",
            entityId: createdProject._id.toString(),
            metadata: {
              projectName: createdProject.name,
              status: createdProject.status,
              visibility: createdProject.visibility,
            },
            occurredAt: new Date(),
          },
        ],
        {
          session,
        },
      );

      createdActivityEvent = activityDocuments[0];
    });

    return res.status(201).json({
      message: "Project created successfully.",
      project: createdProject,
      membership: createdMembership,
      activityEvent: createdActivityEvent,
    });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        error: "Validation failed.",
        fields: getMongooseValidationFields(error),
      });
    }

    if (error?.code === 11000) {
      return res.status(409).json({
        error: "A conflicting project record already exists.",
      });
    }

    console.error("Project creation route error:", error);

    return res.status(500).json({
      error: "Unable to create the project. Please try again.",
    });
  } finally {
    await session.endSession();
  }
});

module.exports = router;
