const express = require("express");
const mongoose = require("mongoose");
const fetch = require("node-fetch");

const ActivityEvent = require("../models/ActivityEvent");
const Project = require("../models/Project");
const ProjectMembership = require("../models/ProjectMembership");
const User = require("../models/User");

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
const PROJECT_REPOSITORY_WRITE_ROLES = new Set(["owner", "host"]);
const PROJECT_MEMBER_WRITE_ROLES = new Set(["owner", "host"]);
const PROJECT_INVITE_ROLES = new Set(["host", "collaborator", "viewer"]);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getMongooseValidationFields(error) {
  return Object.fromEntries(
    Object.entries(error.errors).map(([fieldName, fieldError]) => [
      fieldName,
      fieldError.message,
    ]),
  );
}

function normalizeDateValue(dateValue) {
  if (!dateValue) {
    return null;
  }

  const parsedDate = new Date(dateValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate;
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

  const defaultBranch =
    typeof repository.defaultBranch === "string"
      ? repository.defaultBranch.trim()
      : "";

  if (!provider && !owner && !name && !url && !defaultBranch) {
    return undefined;
  }

  return {
    provider,
    owner,
    name,
    url,
    defaultBranch,
    repositoryUpdatedAt: normalizeDateValue(repository.repositoryUpdatedAt),
    connectedAt: normalizeDateValue(repository.connectedAt),
    syncedAt: normalizeDateValue(repository.syncedAt),
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

  if (repository.defaultBranch && repository.defaultBranch.length > 100) {
    errors["repository.defaultBranch"] =
      "Default branch cannot exceed 100 characters.";
  }

  return errors;
}

function parseGitHubRepositoryUrl(repositoryUrl) {
  const normalizedUrl =
    typeof repositoryUrl === "string" ? repositoryUrl.trim() : "";

  if (!normalizedUrl) {
    return {
      error: "Repository URL is required.",
    };
  }

  let parsedUrl;

  try {
    parsedUrl = new URL(normalizedUrl);
  } catch {
    return {
      error: "Repository URL must be a valid GitHub HTTPS URL.",
    };
  }

  if (parsedUrl.protocol !== "https:" || parsedUrl.hostname !== "github.com") {
    return {
      error: "Repository URL must be a valid GitHub HTTPS URL.",
    };
  }

  const [owner, rawRepositoryName] = parsedUrl.pathname
    .split("/")
    .filter(Boolean);

  const repositoryName = rawRepositoryName?.replace(/\.git$/i, "");

  if (!owner || !repositoryName) {
    return {
      error: "Repository URL must include an owner and repository name.",
    };
  }

  return {
    repository: {
      provider: "github",
      owner,
      name: repositoryName,
      url: `https://github.com/${owner}/${repositoryName}`,
    },
  };
}

function getGitHubRequestHeaders() {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "SkillForge",
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  return headers;
}

async function fetchGitHubRepositoryMetadata({ owner, name }) {
  const repositoryResponse = await fetch(
    `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}`,
    {
      headers: getGitHubRequestHeaders(),
    },
  );

  const repositoryData = await repositoryResponse.json();

  if (!repositoryResponse.ok) {
    const status = repositoryResponse.status === 404 ? 404 : 502;

    const error = new Error(
      repositoryData.message || "Unable to fetch GitHub repository metadata.",
    );

    error.status = status;

    throw error;
  }

  return {
    provider: "github",
    owner: repositoryData.owner?.login || owner,
    name: repositoryData.name || name,
    url: repositoryData.html_url,
    defaultBranch: repositoryData.default_branch || "",
    repositoryUpdatedAt: normalizeDateValue(repositoryData.updated_at),
    connectedAt: new Date(),
    syncedAt: new Date(),
  };
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

function formatInvitationMembership(projectMembership) {
  const project = projectMembership.projectId;
  const invitedBy = projectMembership.invitedBy;

  return {
    id: projectMembership._id,
    projectId: project?._id || projectMembership.projectId,
    projectName: project?.name || "Untitled project",
    projectDescription: project?.description || "",
    projectStatus: project?.status || "active",
    projectVisibility: project?.visibility || "private",
    role: projectMembership.role,
    status: projectMembership.status,
    invitedBy: invitedBy
      ? {
          id: invitedBy._id,
          fullName: invitedBy.fullName,
          email: invitedBy.email,
        }
      : null,
    invitedAt: projectMembership.createdAt,
    updatedAt: projectMembership.updatedAt,
  };
}

router.get("/invitations/pending", requireAuth, async (req, res) => {
  try {
    const invitations = await ProjectMembership.find({
      userId: req.user._id,
      status: "invited",
    })
      .populate({
        path: "projectId",
        select: "name description status visibility createdAt updatedAt",
      })
      .populate({
        path: "invitedBy",
        select: "fullName email",
      })
      .sort({
        updatedAt: -1,
      })
      .lean();

    return res.status(200).json({
      invitations: invitations.map(formatInvitationMembership),
    });
  } catch (error) {
    console.error("Pending project invitations route error:", error);

    return res.status(500).json({
      error: "Unable to load project invitations. Please try again.",
    });
  }
});

router.patch(
  "/:projectId/invitations/accept",
  requireAuth,
  async (req, res) => {
    const { projectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        error: "Invalid project ID.",
      });
    }

    try {
      const invitedMembership = await ProjectMembership.findOne({
        projectId,
        userId: req.user._id,
        status: "invited",
      });

      if (!invitedMembership) {
        return res.status(404).json({
          error: "Project invitation not found.",
        });
      }

      invitedMembership.status = "active";
      invitedMembership.joinedAt = new Date();
      invitedMembership.leftAt = null;

      await invitedMembership.save();

      const project = await Project.findById(projectId).lean();

      const activityEvent = await ActivityEvent.create({
        projectId,
        actorId: req.user._id,
        eventType: "member_invitation_accepted",
        source: "skillforge",
        entityType: "project_membership",
        entityId: invitedMembership._id.toString(),
        metadata: {
          userId: req.user._id,
          role: invitedMembership.role,
          status: "active",
        },
        occurredAt: new Date(),
      });

      return res.status(200).json({
        message: "Project invitation accepted.",
        invitation: {
          id: invitedMembership._id,
          projectId: invitedMembership.projectId,
          projectName: project?.name || "Untitled project",
          role: invitedMembership.role,
          status: invitedMembership.status,
          joinedAt: invitedMembership.joinedAt,
          updatedAt: invitedMembership.updatedAt,
        },
        activityEvent,
      });
    } catch (error) {
      console.error("Accept project invitation route error:", error);

      return res.status(500).json({
        error: "Unable to accept project invitation. Please try again.",
      });
    }
  },
);

router.patch(
  "/:projectId/invitations/decline",
  requireAuth,
  async (req, res) => {
    const { projectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        error: "Invalid project ID.",
      });
    }

    try {
      const invitedMembership = await ProjectMembership.findOne({
        projectId,
        userId: req.user._id,
        status: "invited",
      });

      if (!invitedMembership) {
        return res.status(404).json({
          error: "Project invitation not found.",
        });
      }

      invitedMembership.status = "removed";
      invitedMembership.leftAt = new Date();

      await invitedMembership.save();

      const project = await Project.findById(projectId).lean();

      const activityEvent = await ActivityEvent.create({
        projectId,
        actorId: req.user._id,
        eventType: "member_invitation_declined",
        source: "skillforge",
        entityType: "project_membership",
        entityId: invitedMembership._id.toString(),
        metadata: {
          userId: req.user._id,
          role: invitedMembership.role,
          status: "removed",
        },
        occurredAt: new Date(),
      });

      return res.status(200).json({
        message: "Project invitation declined.",
        invitation: {
          id: invitedMembership._id,
          projectId: invitedMembership.projectId,
          projectName: project?.name || "Untitled project",
          role: invitedMembership.role,
          status: invitedMembership.status,
          leftAt: invitedMembership.leftAt,
          updatedAt: invitedMembership.updatedAt,
        },
        activityEvent,
      });
    } catch (error) {
      console.error("Decline project invitation route error:", error);

      return res.status(500).json({
        error: "Unable to decline project invitation. Please try again.",
      });
    }
  },
);

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

router.get("/:projectId/members", requireAuth, async (req, res) => {
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

    const projectMembers = await ProjectMembership.find({
      projectId,
      status: {
        $ne: "removed",
      },
    })
      .populate({
        path: "userId",
        select: "fullName email membership createdAt",
      })
      .sort({
        joinedAt: 1,
      })
      .lean();

    const roleOrder = {
      owner: 1,
      host: 2,
      collaborator: 3,
      viewer: 4,
    };

    const members = projectMembers
      .sort((firstMember, secondMember) => {
        return (
          (roleOrder[firstMember.role] || 99) -
          (roleOrder[secondMember.role] || 99)
        );
      })
      .map((projectMember) => {
        const user = projectMember.userId;

        return {
          id: projectMember._id,
          projectId: projectMember.projectId,
          userId: user?._id || projectMember.userId,
          fullName: user?.fullName || "Unknown member",
          email: user?.email || "",
          accountMembership: user?.membership || "free",
          role: projectMember.role,
          status: projectMember.status,
          invitedBy: projectMember.invitedBy,
          joinedAt: projectMember.joinedAt,
          leftAt: projectMember.leftAt,
          createdAt: projectMember.createdAt,
          updatedAt: projectMember.updatedAt,
        };
      });

    return res.status(200).json({
      members,
      currentUserMembership: {
        role: membership.role,
        status: membership.status,
        joinedAt: membership.joinedAt,
      },
    });
  } catch (error) {
    console.error("Project members route error:", error);

    return res.status(500).json({
      error: "Unable to load project members. Please try again.",
    });
  }
});

router.post("/:projectId/members/invite", requireAuth, async (req, res) => {
  const { projectId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    return res.status(400).json({
      error: "Invalid project ID.",
    });
  }

  const email =
    typeof req.body?.email === "string"
      ? req.body.email.trim().toLowerCase()
      : "";

  const role =
    typeof req.body?.role === "string"
      ? req.body.role.trim().toLowerCase()
      : "collaborator";

  const validationErrors = {};

  if (!email) {
    validationErrors.email = "Member email is required.";
  } else if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
    validationErrors.email = "Enter a valid member email address.";
  }

  if (!PROJECT_INVITE_ROLES.has(role)) {
    validationErrors.role =
      "Invite role must be host, collaborator, or viewer.";
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

    if (!PROJECT_MEMBER_WRITE_ROLES.has(membership.role)) {
      return res.status(403).json({
        error: "Only project owners and hosts can invite members.",
      });
    }

    const invitedUser = await User.findOne({
      email,
    }).lean();

    if (!invitedUser) {
      return res.status(404).json({
        error: "SkillForge user not found.",
        fields: {
          email: "No SkillForge account was found for this email address.",
        },
      });
    }

    const existingMembership = await ProjectMembership.findOne({
      projectId,
      userId: invitedUser._id,
    }).lean();

    if (existingMembership && existingMembership.status !== "removed") {
      return res.status(409).json({
        error: "This user is already attached to the project.",
        fields: {
          email: "This user already has a project membership.",
        },
      });
    }

    const invitedMembership = existingMembership
      ? await ProjectMembership.findByIdAndUpdate(
          existingMembership._id,
          {
            role,
            status: "invited",
            invitedBy: req.user._id,
            joinedAt: new Date(),
            leftAt: null,
          },
          {
            new: true,
            runValidators: true,
          },
        )
      : await ProjectMembership.create({
          projectId,
          userId: invitedUser._id,
          role,
          status: "invited",
          invitedBy: req.user._id,
        });

    const populatedMembership = await ProjectMembership.findById(
      invitedMembership._id,
    )
      .populate({
        path: "userId",
        select: "fullName email membership createdAt",
      })
      .lean();

    const user = populatedMembership.userId;

    const member = {
      id: populatedMembership._id,
      projectId: populatedMembership.projectId,
      userId: user?._id || populatedMembership.userId,
      fullName: user?.fullName || "Unknown member",
      email: user?.email || "",
      accountMembership: user?.membership || "free",
      role: populatedMembership.role,
      status: populatedMembership.status,
      invitedBy: populatedMembership.invitedBy,
      joinedAt: populatedMembership.joinedAt,
      leftAt: populatedMembership.leftAt,
      createdAt: populatedMembership.createdAt,
      updatedAt: populatedMembership.updatedAt,
    };

    const activityEvent = await ActivityEvent.create({
      projectId,
      actorId: req.user._id,
      eventType: "member_invited",
      source: "skillforge",
      entityType: "project_membership",
      entityId: invitedMembership._id.toString(),
      metadata: {
        invitedUserId: invitedUser._id,
        invitedEmail: invitedUser.email,
        invitedFullName: invitedUser.fullName,
        role,
        status: "invited",
      },
      occurredAt: new Date(),
    });

    return res.status(201).json({
      message: "Member invited successfully.",
      member,
      activityEvent,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        error: "This user is already attached to the project.",
        fields: {
          email: "This user already has a project membership.",
        },
      });
    }

    console.error("Project member invite route error:", error);

    return res.status(500).json({
      error: "Unable to invite project member. Please try again.",
    });
  }
});

router.patch("/:projectId/repository", requireAuth, async (req, res) => {
  const { projectId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    return res.status(400).json({
      error: "Invalid project ID.",
    });
  }

  const parsedRepository = parseGitHubRepositoryUrl(
    req.body?.repositoryUrl || req.body?.url,
  );

  if (parsedRepository.error) {
    return res.status(400).json({
      error: "Validation failed.",
      fields: {
        repositoryUrl: parsedRepository.error,
      },
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

    if (!PROJECT_REPOSITORY_WRITE_ROLES.has(membership.role)) {
      return res.status(403).json({
        error: "Only project owners and hosts can connect repositories.",
      });
    }

    const repositoryMetadata = await fetchGitHubRepositoryMetadata({
      owner: parsedRepository.repository.owner,
      name: parsedRepository.repository.name,
    });

    const project = await Project.findByIdAndUpdate(
      projectId,
      {
        repository: repositoryMetadata,
      },
      {
        new: true,
        runValidators: true,
      },
    ).lean();

    if (!project) {
      return res.status(404).json({
        error: "Project not found.",
      });
    }

    const activityEvent = await ActivityEvent.create({
      projectId,
      actorId: req.user._id,
      eventType: "repository_connected",
      source: "github",
      entityType: "repository",
      entityId: `${repositoryMetadata.owner}/${repositoryMetadata.name}`,
      metadata: {
        provider: repositoryMetadata.provider,
        owner: repositoryMetadata.owner,
        name: repositoryMetadata.name,
        url: repositoryMetadata.url,
        defaultBranch: repositoryMetadata.defaultBranch,
      },
      occurredAt: new Date(),
    });

    return res.status(200).json({
      message: "Repository connected successfully.",
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
      repository: project.repository,
      activityEvent,
    });
  } catch (error) {
    console.error("Project repository connection route error:", error);

    return res.status(error.status || 500).json({
      error:
        error.status === 404
          ? "GitHub repository not found."
          : "Unable to connect repository. Please try again.",
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
