const express = require("express");
const mongoose = require("mongoose");

const Organization = require("../models/Organization");
const OrganizationMembership = require("../models/OrganizationMembership");
const User = require("../models/User");

const requireAuth = require("../middleware/auth");
const {
  requireOrganizationMembership,
  requireOrganizationRole,
  requireOrganizationWritable,
} = require("../middleware/organizationAccess");

const router = express.Router();

const ORGANIZATION_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ORGANIZATION_INVITATION_ROLES = new Set(["admin", "member"]);

const ORGANIZATION_ROLE_ORDER = new Map([
  ["owner", 0],
  ["admin", 1],
  ["member", 2],
]);

const ORGANIZATION_STATUS_ORDER = new Map([
  ["active", 0],
  ["invited", 1],
  ["inactive", 2],
  ["removed", 3],
]);

function getMongooseValidationFields(error) {
  return Object.fromEntries(
    Object.entries(error.errors).map(([fieldName, fieldError]) => [
      fieldName,
      fieldError.message,
    ]),
  );
}

function formatOrganizationResult(organization, membership) {
  return {
    ...organization,
    id: organization._id,
    membership: {
      role: membership.role,
      status: membership.status,
      joinedAt: membership.joinedAt,
    },
  };
}

function formatOrganizationMember(membership) {
  const user = membership.userId;
  const invitedBy = membership.invitedBy;

  return {
    id: membership._id,
    organizationId: membership.organizationId,
    userId: user?._id ?? membership.userId,
    fullName: user?.fullName ?? "",
    email: user?.email ?? "",
    role: membership.role,
    status: membership.status,
    invitedBy: invitedBy
      ? {
          id: invitedBy._id,
          fullName: invitedBy.fullName,
          email: invitedBy.email,
        }
      : null,
    invitedAt: membership.invitedAt,
    joinedAt: membership.joinedAt,
    leftAt: membership.leftAt,
    createdAt: membership.createdAt,
    updatedAt: membership.updatedAt,
  };
}

function formatOrganizationInvitation(membership) {
  const organization = membership.organizationId;
  const invitedBy = membership.invitedBy;

  return {
    id: membership._id,
    organizationId: organization?._id ?? membership.organizationId,
    organizationName: organization?.name ?? "Untitled organization",
    organizationSlug: organization?.slug ?? "",
    organizationDescription: organization?.description ?? "",
    organizationStatus: organization?.status ?? "active",
    role: membership.role,
    status: membership.status,
    invitedBy: invitedBy
      ? {
          id: invitedBy._id,
          fullName: invitedBy.fullName,
          email: invitedBy.email,
        }
      : null,
    invitedAt: membership.invitedAt,
    joinedAt: membership.joinedAt,
    leftAt: membership.leftAt,
    createdAt: membership.createdAt,
    updatedAt: membership.updatedAt,
  };
}

function compareOrganizationMembers(firstMember, secondMember) {
  const firstRoleOrder =
    ORGANIZATION_ROLE_ORDER.get(firstMember.role) ?? Number.MAX_SAFE_INTEGER;

  const secondRoleOrder =
    ORGANIZATION_ROLE_ORDER.get(secondMember.role) ?? Number.MAX_SAFE_INTEGER;

  if (firstRoleOrder !== secondRoleOrder) {
    return firstRoleOrder - secondRoleOrder;
  }

  const firstStatusOrder =
    ORGANIZATION_STATUS_ORDER.get(firstMember.status) ??
    Number.MAX_SAFE_INTEGER;

  const secondStatusOrder =
    ORGANIZATION_STATUS_ORDER.get(secondMember.status) ??
    Number.MAX_SAFE_INTEGER;

  if (firstStatusOrder !== secondStatusOrder) {
    return firstStatusOrder - secondStatusOrder;
  }

  return new Date(firstMember.createdAt) - new Date(secondMember.createdAt);
}

function normalizeOrganizationSlug(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

router.get("/", requireAuth, async (req, res) => {
  try {
    const memberships = await OrganizationMembership.find({
      userId: req.user._id,
      status: "active",
    })
      .sort({
        updatedAt: -1,
      })
      .lean();

    if (memberships.length === 0) {
      return res.status(200).json({
        organizations: [],
      });
    }

    const membershipByOrganizationId = new Map(
      memberships.map((membership) => [
        membership.organizationId.toString(),
        membership,
      ]),
    );

    const organizations = await Organization.find({
      _id: {
        $in: memberships.map((membership) => membership.organizationId),
      },
    })
      .sort({
        updatedAt: -1,
      })
      .lean();

    const organizationResults = organizations.map((organization) => {
      const membership = membershipByOrganizationId.get(
        organization._id.toString(),
      );

      return formatOrganizationResult(organization, membership);
    });

    return res.status(200).json({
      organizations: organizationResults,
    });
  } catch (error) {
    console.error("Organization list route error:", error);

    return res.status(500).json({
      error: "Unable to load organizations. Please try again.",
    });
  }
});

router.get("/invitations/pending", requireAuth, async (req, res) => {
  try {
    const invitations = await OrganizationMembership.find({
      userId: req.user._id,
      status: "invited",
    })
      .populate({
        path: "organizationId",
        select: "name slug description status createdAt updatedAt",
      })
      .populate({
        path: "invitedBy",
        select: "fullName email",
      })
      .sort({
        invitedAt: -1,
        updatedAt: -1,
      })
      .lean();

    return res.status(200).json({
      invitations: invitations.map(formatOrganizationInvitation),
    });
  } catch (error) {
    console.error("Pending organization invitations route error:", error);

    return res.status(500).json({
      error: "Unable to load organization invitations. Please try again.",
    });
  }
});

router.post(
  "/:organizationId/invitations",
  requireAuth,
  requireOrganizationMembership,
  requireOrganizationRole("owner", "admin"),
  requireOrganizationWritable,
  async (req, res) => {
    const email =
      typeof req.body?.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";

    const role =
      typeof req.body?.role === "string"
        ? req.body.role.trim().toLowerCase()
        : "member";

    const validationErrors = {};

    if (!email) {
      validationErrors.email = "Email address is required.";
    } else if (!EMAIL_PATTERN.test(email)) {
      validationErrors.email = "Enter a valid email address.";
    } else if (email.length > 254) {
      validationErrors.email = "Email address is too long.";
    }

    if (!ORGANIZATION_INVITATION_ROLES.has(role)) {
      validationErrors.role =
        "Organization invitation role must be admin or member.";
    }

    if (Object.keys(validationErrors).length > 0) {
      return res.status(400).json({
        error: "Validation failed.",
        fields: validationErrors,
      });
    }

    const currentUserMembership = req.organizationAccess.membership;

    if (role === "admin" && currentUserMembership.role !== "owner") {
      return res.status(403).json({
        error: "Only the organization Owner can invite an Admin.",
      });
    }

    try {
      const targetUser = await User.findOne({
        email,
      }).lean();

      if (!targetUser) {
        return res.status(404).json({
          error: "A SkillForge account with this email address was not found.",
        });
      }

      const organizationId = req.organizationAccess.organization._id;

      let membership = await OrganizationMembership.findOne({
        organizationId,
        userId: targetUser._id,
      });

      if (membership?.status === "active") {
        return res.status(409).json({
          error: "This user is already an active organization member.",
        });
      }

      if (membership?.status === "invited") {
        return res.status(409).json({
          error: "This user already has a pending organization invitation.",
        });
      }

      const invitedAt = new Date();
      const restoredMembership = Boolean(membership);

      if (membership) {
        membership.role = role;
        membership.status = "invited";
        membership.invitedBy = req.user._id;
        membership.invitedAt = invitedAt;
        membership.joinedAt = null;
        membership.leftAt = null;

        await membership.save();
      } else {
        membership = await OrganizationMembership.create({
          organizationId,
          userId: targetUser._id,
          role,
          status: "invited",
          invitedBy: req.user._id,
          invitedAt,
          joinedAt: null,
          leftAt: null,
        });
      }

      const populatedMembership = await OrganizationMembership.findById(
        membership._id,
      )
        .populate({
          path: "userId",
          select: "fullName email",
        })
        .populate({
          path: "invitedBy",
          select: "fullName email",
        })
        .lean();

      return res.status(201).json({
        message: restoredMembership
          ? "Organization invitation renewed successfully."
          : "Organization invitation created successfully.",
        invitation: formatOrganizationMember(populatedMembership),
        restored: restoredMembership,
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
          error:
            "An organization membership already exists for this SkillForge user.",
        });
      }

      console.error("Organization invitation route error:", error);

      return res.status(500).json({
        error:
          "Unable to create the organization invitation. Please try again.",
      });
    }
  },
);

router.patch(
  "/:organizationId/invitations/accept",
  requireAuth,
  async (req, res) => {
    const { organizationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(organizationId)) {
      return res.status(400).json({
        error: "Invalid organization ID.",
      });
    }

    try {
      const pendingInvitation = await OrganizationMembership.findOne({
        organizationId,
        userId: req.user._id,
        status: "invited",
      }).lean();

      if (!pendingInvitation) {
        return res.status(404).json({
          error: "Organization invitation not found.",
        });
      }

      const organization = await Organization.findById(organizationId).lean();

      if (!organization) {
        return res.status(404).json({
          error: "Organization invitation not found.",
        });
      }

      if (organization.status === "archived") {
        return res.status(409).json({
          error: "Archived organization invitations cannot be accepted.",
        });
      }

      const acceptedInvitation = await OrganizationMembership.findOneAndUpdate(
        {
          _id: pendingInvitation._id,
          status: "invited",
        },
        {
          status: "active",
          joinedAt: new Date(),
          leftAt: null,
        },
        {
          returnDocument: "after",
          runValidators: true,
        },
      );

      if (!acceptedInvitation) {
        return res.status(409).json({
          error: "This organization invitation is no longer pending.",
        });
      }

      const populatedInvitation = await OrganizationMembership.findById(
        acceptedInvitation._id,
      )
        .populate({
          path: "organizationId",
          select: "name slug description status createdAt updatedAt",
        })
        .populate({
          path: "invitedBy",
          select: "fullName email",
        })
        .lean();

      return res.status(200).json({
        message: "Organization invitation accepted.",
        invitation: formatOrganizationInvitation(populatedInvitation),
      });
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        return res.status(400).json({
          error: "Validation failed.",
          fields: getMongooseValidationFields(error),
        });
      }

      console.error("Accept organization invitation route error:", error);

      return res.status(500).json({
        error:
          "Unable to accept the organization invitation. Please try again.",
      });
    }
  },
);

router.patch(
  "/:organizationId/invitations/decline",
  requireAuth,
  async (req, res) => {
    const { organizationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(organizationId)) {
      return res.status(400).json({
        error: "Invalid organization ID.",
      });
    }

    try {
      const pendingInvitation = await OrganizationMembership.findOne({
        organizationId,
        userId: req.user._id,
        status: "invited",
      }).lean();

      if (!pendingInvitation) {
        return res.status(404).json({
          error: "Organization invitation not found.",
        });
      }

      const organization = await Organization.findById(organizationId).lean();

      if (!organization) {
        return res.status(404).json({
          error: "Organization invitation not found.",
        });
      }

      if (organization.status === "archived") {
        return res.status(409).json({
          error: "Archived organization invitations cannot be declined.",
        });
      }

      const declinedInvitation = await OrganizationMembership.findOneAndUpdate(
        {
          _id: pendingInvitation._id,
          status: "invited",
        },
        {
          status: "removed",
          joinedAt: null,
          leftAt: new Date(),
        },
        {
          returnDocument: "after",
          runValidators: true,
        },
      );

      if (!declinedInvitation) {
        return res.status(409).json({
          error: "This organization invitation is no longer pending.",
        });
      }

      const populatedInvitation = await OrganizationMembership.findById(
        declinedInvitation._id,
      )
        .populate({
          path: "organizationId",
          select: "name slug description status createdAt updatedAt",
        })
        .populate({
          path: "invitedBy",
          select: "fullName email",
        })
        .lean();

      return res.status(200).json({
        message: "Organization invitation declined.",
        invitation: formatOrganizationInvitation(populatedInvitation),
      });
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        return res.status(400).json({
          error: "Validation failed.",
          fields: getMongooseValidationFields(error),
        });
      }

      console.error("Decline organization invitation route error:", error);

      return res.status(500).json({
        error:
          "Unable to decline the organization invitation. Please try again.",
      });
    }
  },
);

router.get(
  "/:organizationId/members",
  requireAuth,
  requireOrganizationMembership,
  async (req, res) => {
    const { organization, membership: currentUserMembership } =
      req.organizationAccess;

    try {
      const memberships = await OrganizationMembership.find({
        organizationId: organization._id,
      })
        .populate({
          path: "userId",
          select: "fullName email",
        })
        .populate({
          path: "invitedBy",
          select: "fullName email",
        })
        .lean();

      const members = memberships
        .map(formatOrganizationMember)
        .sort(compareOrganizationMembers);

      const currentMembership =
        members.find(
          (member) =>
            member.id.toString() === currentUserMembership._id.toString(),
        ) ?? null;

      return res.status(200).json({
        organization: {
          id: organization._id,
          name: organization.name,
          slug: organization.slug,
          status: organization.status,
        },
        currentMembership,
        members,
      });
    } catch (error) {
      console.error("Organization member directory route error:", error);

      return res.status(500).json({
        error: "Unable to load organization members. Please try again.",
      });
    }
  },
);

router.get(
  "/:organizationId",
  requireAuth,
  requireOrganizationMembership,
  (req, res) => {
    const { organization, membership } = req.organizationAccess;

    return res.status(200).json({
      organization: formatOrganizationResult(organization, membership),
    });
  },
);

router.patch(
  "/:organizationId",
  requireAuth,
  requireOrganizationMembership,
  requireOrganizationRole("owner", "admin"),
  requireOrganizationWritable,
  async (req, res) => {
    const hasName = Object.prototype.hasOwnProperty.call(
      req.body ?? {},
      "name",
    );

    const hasDescription = Object.prototype.hasOwnProperty.call(
      req.body ?? {},
      "description",
    );

    const hasSlug = Object.prototype.hasOwnProperty.call(
      req.body ?? {},
      "slug",
    );

    if (!hasName && !hasDescription && !hasSlug) {
      return res.status(400).json({
        error: "Provide a name, description, or slug to update.",
      });
    }

    const validationErrors = {};
    const updates = {};

    if (hasName) {
      if (typeof req.body.name !== "string") {
        validationErrors.name = "Organization name must be text.";
      } else {
        const name = req.body.name.trim();

        if (name.length < 2) {
          validationErrors.name =
            "Organization name must contain at least 2 characters.";
        } else if (name.length > 120) {
          validationErrors.name =
            "Organization name cannot exceed 120 characters.";
        } else {
          updates.name = name;
        }
      }
    }

    if (hasDescription) {
      if (typeof req.body.description !== "string") {
        validationErrors.description = "Organization description must be text.";
      } else {
        const description = req.body.description.trim();

        if (description.length > 1000) {
          validationErrors.description =
            "Organization description cannot exceed 1000 characters.";
        } else {
          updates.description = description;
        }
      }
    }

    if (hasSlug) {
      if (typeof req.body.slug !== "string") {
        validationErrors.slug = "Organization slug must be text.";
      } else {
        const slug = normalizeOrganizationSlug(req.body.slug);

        if (slug.length < 2) {
          validationErrors.slug =
            "Organization slug must contain at least 2 characters.";
        } else if (slug.length > 120) {
          validationErrors.slug =
            "Organization slug cannot exceed 120 characters.";
        } else if (!ORGANIZATION_SLUG_PATTERN.test(slug)) {
          validationErrors.slug =
            "Organization slug may contain lowercase letters, numbers, and hyphens.";
        } else {
          updates.slug = slug;
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
      const updatedOrganization = await Organization.findByIdAndUpdate(
        req.organizationAccess.organization._id,
        updates,
        {
          returnDocument: "after",
          runValidators: true,
        },
      ).lean();

      if (!updatedOrganization) {
        return res.status(404).json({
          error: "Organization not found.",
        });
      }

      return res.status(200).json({
        message: "Organization updated successfully.",
        organization: formatOrganizationResult(
          updatedOrganization,
          req.organizationAccess.membership,
        ),
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
          error: "An organization with this slug already exists.",
          fields: {
            slug: "Choose a different organization slug.",
          },
        });
      }

      console.error("Organization update route error:", error);

      return res.status(500).json({
        error: "Unable to update the organization. Please try again.",
      });
    }
  },
);

router.patch(
  "/:organizationId/archive",
  requireAuth,
  requireOrganizationMembership,
  requireOrganizationRole("owner"),
  async (req, res) => {
    const existingOrganization = req.organizationAccess.organization;

    if (existingOrganization.status === "archived") {
      return res.status(409).json({
        error: "This organization is already archived.",
      });
    }

    const archivedAt = new Date();

    try {
      const archivedOrganization = await Organization.findByIdAndUpdate(
        existingOrganization._id,
        {
          status: "archived",
          archivedAt,
        },
        {
          returnDocument: "after",
          runValidators: true,
        },
      ).lean();

      if (!archivedOrganization) {
        return res.status(404).json({
          error: "Organization not found.",
        });
      }

      return res.status(200).json({
        message: "Organization archived successfully.",
        organization: formatOrganizationResult(
          archivedOrganization,
          req.organizationAccess.membership,
        ),
      });
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        return res.status(400).json({
          error: "Validation failed.",
          fields: getMongooseValidationFields(error),
        });
      }

      console.error("Organization archive route error:", error);

      return res.status(500).json({
        error: "Unable to archive the organization. Please try again.",
      });
    }
  },
);

router.post("/", requireAuth, async (req, res) => {
  const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";

  const description =
    typeof req.body?.description === "string"
      ? req.body.description.trim()
      : "";

  const requestedSlug =
    typeof req.body?.slug === "string" && req.body.slug.trim()
      ? req.body.slug
      : name;

  const slug = normalizeOrganizationSlug(requestedSlug);

  const validationErrors = {};

  if (name.length < 2) {
    validationErrors.name =
      "Organization name must contain at least 2 characters.";
  } else if (name.length > 120) {
    validationErrors.name =
      "Organization name cannot exceed 120 characters.";
  }

  if (description.length > 1000) {
    validationErrors.description =
      "Organization description cannot exceed 1000 characters.";
  }

  if (slug.length < 2) {
    validationErrors.slug =
      "Organization slug must contain at least 2 characters.";
  } else if (slug.length > 120) {
    validationErrors.slug =
      "Organization slug cannot exceed 120 characters.";
  } else if (!ORGANIZATION_SLUG_PATTERN.test(slug)) {
    validationErrors.slug =
      "Organization slug may contain lowercase letters, numbers, and hyphens.";
  }

  if (Object.keys(validationErrors).length > 0) {
    return res.status(400).json({
      error: "Validation failed.",
      fields: validationErrors,
    });
  }

  const session = await mongoose.startSession();

  let createdOrganization;
  let createdMembership;

  try {
    await session.withTransaction(async () => {
      const organizationDocuments = await Organization.create(
        [
          {
            name,
            slug,
            description,
            createdById: req.user._id,
            status: "active",
          },
        ],
        {
          session,
        },
      );

      createdOrganization = organizationDocuments[0];

      const membershipDocuments = await OrganizationMembership.create(
        [
          {
            organizationId: createdOrganization._id,
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
    });

    return res.status(201).json({
      message: "Organization created successfully.",
      organization: createdOrganization,
      membership: createdMembership,
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
        error: "An organization with this slug already exists.",
        fields: {
          slug: "Choose a different organization slug.",
        },
      });
    }

    console.error("Organization creation route error:", error);

    return res.status(500).json({
      error: "Unable to create the organization. Please try again.",
    });
  } finally {
    await session.endSession();
  }
});

module.exports = router;