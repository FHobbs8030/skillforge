const express = require("express");
const mongoose = require("mongoose");

const ActivityEvent = require("../models/ActivityEvent");
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
const ORGANIZATION_ASSIGNABLE_MEMBER_ROLES = new Set(["admin", "member"]);

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

async function createOrganizationActivityEvent({
  organizationId,
  actorId,
  eventType,
  entityType,
  entityId,
  metadata = {},
  session = null,
}) {
  const activityEvent = new ActivityEvent({
    organizationId,
    actorId,
    eventType,
    source: "skillforge",
    entityType,
    entityId: entityId?.toString() ?? "",
    metadata,
    occurredAt: new Date(),
  });

  if (session) {
    await activityEvent.save({
      session,
    });
  } else {
    await activityEvent.save();
  }

  return activityEvent;
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
      const session = await mongoose.startSession();

      let membership;
      let restoredMembership = false;

      try {
        await session.withTransaction(async () => {
          membership = await OrganizationMembership.findOne({
            organizationId,
            userId: targetUser._id,
          }).session(session);

          if (membership?.status === "active") {
            throw Object.assign(
              new Error("This user is already an active organization member."),
              {
                statusCode: 409,
              },
            );
          }

          if (membership?.status === "invited") {
            throw Object.assign(
              new Error(
                "This user already has a pending organization invitation.",
              ),
              {
                statusCode: 409,
              },
            );
          }

          const invitedAt = new Date();
          restoredMembership = Boolean(membership);

          if (membership) {
            membership.role = role;
            membership.status = "invited";
            membership.invitedBy = req.user._id;
            membership.invitedAt = invitedAt;
            membership.joinedAt = null;
            membership.leftAt = null;

            await membership.save({
              session,
            });
          } else {
            const memberships = await OrganizationMembership.create(
              [
                {
                  organizationId,
                  userId: targetUser._id,
                  role,
                  status: "invited",
                  invitedBy: req.user._id,
                  invitedAt,
                  joinedAt: null,
                  leftAt: null,
                },
              ],
              {
                session,
              },
            );

            membership = memberships[0];
          }

          await createOrganizationActivityEvent({
            organizationId,
            actorId: req.user._id,
            eventType: "organization_member_invited",
            entityType: "organization_membership",
            entityId: membership._id,
            metadata: {
              targetUserId: targetUser._id,
              targetEmail: targetUser.email,
              role,
              restored: restoredMembership,
            },
            session,
          });
        });

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
      } finally {
        await session.endSession();
      }
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({
          error: error.message,
        });
      }

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

    const session = await mongoose.startSession();

    let acceptedInvitationId;

    try {
      await session.withTransaction(async () => {
        const pendingInvitation = await OrganizationMembership.findOne({
          organizationId,
          userId: req.user._id,
          status: "invited",
        })
          .session(session)
          .lean();

        if (!pendingInvitation) {
          throw Object.assign(new Error("Organization invitation not found."), {
            statusCode: 404,
          });
        }

        const organization = await Organization.findById(organizationId)
          .session(session)
          .lean();

        if (!organization) {
          throw Object.assign(new Error("Organization invitation not found."), {
            statusCode: 404,
          });
        }

        if (organization.status === "archived") {
          throw Object.assign(
            new Error("Archived organization invitations cannot be accepted."),
            {
              statusCode: 409,
            },
          );
        }

        const acceptedInvitation =
          await OrganizationMembership.findOneAndUpdate(
            {
              _id: pendingInvitation._id,
              organizationId,
              userId: req.user._id,
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
              session,
            },
          );

        if (!acceptedInvitation) {
          throw Object.assign(
            new Error("This organization invitation is no longer pending."),
            {
              statusCode: 409,
            },
          );
        }

        await createOrganizationActivityEvent({
          organizationId: organization._id,
          actorId: req.user._id,
          eventType: "organization_invitation_accepted",
          entityType: "organization_membership",
          entityId: acceptedInvitation._id,
          metadata: {
            memberUserId: req.user._id,
            role: acceptedInvitation.role,
            previousStatus: "invited",
            status: "active",
            invitedBy: acceptedInvitation.invitedBy,
          },
          session,
        });

        acceptedInvitationId = acceptedInvitation._id;
      });

      const populatedInvitation = await OrganizationMembership.findById(
        acceptedInvitationId,
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
      if (error.statusCode) {
        return res.status(error.statusCode).json({
          error: error.message,
        });
      }

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
    } finally {
      await session.endSession();
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

    const session = await mongoose.startSession();

    let declinedInvitationId;

    try {
      await session.withTransaction(async () => {
        const pendingInvitation = await OrganizationMembership.findOne({
          organizationId,
          userId: req.user._id,
          status: "invited",
        })
          .session(session)
          .lean();

        if (!pendingInvitation) {
          throw Object.assign(new Error("Organization invitation not found."), {
            statusCode: 404,
          });
        }

        const organization = await Organization.findById(organizationId)
          .session(session)
          .lean();

        if (!organization) {
          throw Object.assign(new Error("Organization invitation not found."), {
            statusCode: 404,
          });
        }

        if (organization.status === "archived") {
          throw Object.assign(
            new Error("Archived organization invitations cannot be declined."),
            {
              statusCode: 409,
            },
          );
        }

        const declinedInvitation =
          await OrganizationMembership.findOneAndUpdate(
            {
              _id: pendingInvitation._id,
              organizationId,
              userId: req.user._id,
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
              session,
            },
          );

        if (!declinedInvitation) {
          throw Object.assign(
            new Error("This organization invitation is no longer pending."),
            {
              statusCode: 409,
            },
          );
        }

        await createOrganizationActivityEvent({
          organizationId: organization._id,
          actorId: req.user._id,
          eventType: "organization_invitation_declined",
          entityType: "organization_membership",
          entityId: declinedInvitation._id,
          metadata: {
            memberUserId: req.user._id,
            role: declinedInvitation.role,
            previousStatus: "invited",
            status: "removed",
            invitedBy: declinedInvitation.invitedBy,
          },
          session,
        });

        declinedInvitationId = declinedInvitation._id;
      });

      const populatedInvitation = await OrganizationMembership.findById(
        declinedInvitationId,
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
      if (error.statusCode) {
        return res.status(error.statusCode).json({
          error: error.message,
        });
      }

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
    } finally {
      await session.endSession();
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
  "/:organizationId/activity",
  requireAuth,
  requireOrganizationMembership,
  async (req, res) => {
    const { organization } = req.organizationAccess;

    try {
      const activityEvents = await ActivityEvent.find({
        organizationId: organization._id,
      })
        .sort({
          occurredAt: -1,
        })
        .limit(50)
        .lean();

      return res.status(200).json({
        organization: {
          id: organization._id,
          name: organization.name,
          slug: organization.slug,
          status: organization.status,
        },
        activityEvents,
      });
    } catch (error) {
      console.error("Organization activity route error:", error);

      return res.status(500).json({
        error: "Unable to load organization activity. Please try again.",
      });
    }
  },
);

router.patch(
  "/:organizationId/members/:membershipId/role",
  requireAuth,
  requireOrganizationMembership,
  requireOrganizationRole("owner"),
  requireOrganizationWritable,
  async (req, res) => {
    const { membershipId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(membershipId)) {
      return res.status(400).json({
        error: "Invalid organization membership ID.",
      });
    }

    const role =
      typeof req.body?.role === "string"
        ? req.body.role.trim().toLowerCase()
        : "";

    if (!ORGANIZATION_ASSIGNABLE_MEMBER_ROLES.has(role)) {
      return res.status(400).json({
        error: "Validation failed.",
        fields: {
          role: "Organization member role must be admin or member.",
        },
      });
    }

    const { organization, membership: currentUserMembership } =
      req.organizationAccess;

    const session = await mongoose.startSession();

    let updatedMembershipId;

    try {
      await session.withTransaction(async () => {
        const targetMembership = await OrganizationMembership.findOne({
          _id: membershipId,
          organizationId: organization._id,
        })
          .session(session)
          .lean();

        if (!targetMembership) {
          throw Object.assign(new Error("Organization member not found."), {
            statusCode: 404,
          });
        }

        if (targetMembership.status !== "active") {
          throw Object.assign(
            new Error(
              "Only active organization members can have their role changed.",
            ),
            {
              statusCode: 409,
            },
          );
        }

        if (targetMembership.role === "owner") {
          throw Object.assign(
            new Error(
              "Organization ownership must be changed through ownership transfer.",
            ),
            {
              statusCode: 409,
            },
          );
        }

        if (
          targetMembership._id.toString() ===
          currentUserMembership._id.toString()
        ) {
          throw Object.assign(
            new Error(
              "The organization Owner cannot change their role through this route.",
            ),
            {
              statusCode: 409,
            },
          );
        }

        if (targetMembership.role === role) {
          throw Object.assign(
            new Error(`This organization member already has the ${role} role.`),
            {
              statusCode: 409,
            },
          );
        }

        const updatedMembership = await OrganizationMembership.findOneAndUpdate(
          {
            _id: targetMembership._id,
            organizationId: organization._id,
            status: "active",
            role: targetMembership.role,
          },
          {
            role,
          },
          {
            returnDocument: "after",
            runValidators: true,
            session,
          },
        );

        if (!updatedMembership) {
          throw Object.assign(
            new Error(
              "The organization membership changed before the role update completed.",
            ),
            {
              statusCode: 409,
            },
          );
        }

        await createOrganizationActivityEvent({
          organizationId: organization._id,
          actorId: req.user._id,
          eventType: "organization_member_role_changed",
          entityType: "organization_membership",
          entityId: updatedMembership._id,
          metadata: {
            memberUserId: updatedMembership.userId,
            previousRole: targetMembership.role,
            role: updatedMembership.role,
            status: updatedMembership.status,
          },
          session,
        });

        updatedMembershipId = updatedMembership._id;
      });

      const populatedMembership = await OrganizationMembership.findById(
        updatedMembershipId,
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

      return res.status(200).json({
        message: `Organization member role changed to ${role}.`,
        member: formatOrganizationMember(populatedMembership),
      });
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({
          error: error.message,
        });
      }

      if (error instanceof mongoose.Error.ValidationError) {
        return res.status(400).json({
          error: "Validation failed.",
          fields: getMongooseValidationFields(error),
        });
      }

      console.error("Organization member role route error:", error);

      return res.status(500).json({
        error:
          "Unable to change the organization member role. Please try again.",
      });
    } finally {
      await session.endSession();
    }
  },
);

router.patch(
  "/:organizationId/members/:membershipId/deactivate",
  requireAuth,
  requireOrganizationMembership,
  requireOrganizationRole("owner", "admin"),
  requireOrganizationWritable,
  async (req, res) => {
    const { membershipId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(membershipId)) {
      return res.status(400).json({
        error: "Invalid organization membership ID.",
      });
    }

    const { organization, membership: currentUserMembership } =
      req.organizationAccess;

    const session = await mongoose.startSession();

    let deactivatedMembershipId;

    try {
      await session.withTransaction(async () => {
        const targetMembership = await OrganizationMembership.findOne({
          _id: membershipId,
          organizationId: organization._id,
        })
          .session(session)
          .lean();

        if (!targetMembership) {
          throw Object.assign(new Error("Organization member not found."), {
            statusCode: 404,
          });
        }

        if (targetMembership.role === "owner") {
          throw Object.assign(
            new Error(
              "The organization Owner cannot be deactivated. Transfer ownership first.",
            ),
            {
              statusCode: 409,
            },
          );
        }

        if (
          targetMembership._id.toString() ===
          currentUserMembership._id.toString()
        ) {
          throw Object.assign(
            new Error(
              "You cannot deactivate your own organization membership.",
            ),
            {
              statusCode: 409,
            },
          );
        }

        if (
          currentUserMembership.role === "admin" &&
          targetMembership.role !== "member"
        ) {
          throw Object.assign(
            new Error("Organization Admins can only deactivate Members."),
            {
              statusCode: 403,
            },
          );
        }

        if (targetMembership.status !== "active") {
          throw Object.assign(
            new Error("Only active organization members can be deactivated."),
            {
              statusCode: 409,
            },
          );
        }

        const deactivatedMembership =
          await OrganizationMembership.findOneAndUpdate(
            {
              _id: targetMembership._id,
              organizationId: organization._id,
              status: "active",
              role: targetMembership.role,
            },
            {
              status: "inactive",
              leftAt: new Date(),
            },
            {
              returnDocument: "after",
              runValidators: true,
              session,
            },
          );

        if (!deactivatedMembership) {
          throw Object.assign(
            new Error(
              "The organization membership changed before deactivation completed.",
            ),
            {
              statusCode: 409,
            },
          );
        }

        await createOrganizationActivityEvent({
          organizationId: organization._id,
          actorId: req.user._id,
          eventType: "organization_member_deactivated",
          entityType: "organization_membership",
          entityId: deactivatedMembership._id,
          metadata: {
            memberUserId: deactivatedMembership.userId,
            role: deactivatedMembership.role,
            previousStatus: "active",
            status: "inactive",
            leftAt: deactivatedMembership.leftAt,
          },
          session,
        });

        deactivatedMembershipId = deactivatedMembership._id;
      });

      const populatedMembership = await OrganizationMembership.findById(
        deactivatedMembershipId,
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

      return res.status(200).json({
        message: "Organization member deactivated.",
        member: formatOrganizationMember(populatedMembership),
      });
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({
          error: error.message,
        });
      }

      if (error instanceof mongoose.Error.ValidationError) {
        return res.status(400).json({
          error: "Validation failed.",
          fields: getMongooseValidationFields(error),
        });
      }

      console.error("Organization member deactivation route error:", error);

      return res.status(500).json({
        error:
          "Unable to deactivate the organization member. Please try again.",
      });
    } finally {
      await session.endSession();
    }
  },
);

router.patch(
  "/:organizationId/members/:membershipId/reactivate",
  requireAuth,
  requireOrganizationMembership,
  requireOrganizationRole("owner", "admin"),
  requireOrganizationWritable,
  async (req, res) => {
    const { membershipId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(membershipId)) {
      return res.status(400).json({
        error: "Invalid organization membership ID.",
      });
    }

    const { organization, membership: currentUserMembership } =
      req.organizationAccess;

    const session = await mongoose.startSession();

    let reactivatedMembershipId;

    try {
      await session.withTransaction(async () => {
        const targetMembership = await OrganizationMembership.findOne({
          _id: membershipId,
          organizationId: organization._id,
        })
          .session(session)
          .lean();

        if (!targetMembership) {
          throw Object.assign(new Error("Organization member not found."), {
            statusCode: 404,
          });
        }

        if (targetMembership.role === "owner") {
          throw Object.assign(
            new Error(
              "The organization Owner cannot be reactivated through this route.",
            ),
            {
              statusCode: 409,
            },
          );
        }

        if (
          targetMembership._id.toString() ===
          currentUserMembership._id.toString()
        ) {
          throw Object.assign(
            new Error(
              "You cannot reactivate your own organization membership.",
            ),
            {
              statusCode: 409,
            },
          );
        }

        if (
          currentUserMembership.role === "admin" &&
          targetMembership.role !== "member"
        ) {
          throw Object.assign(
            new Error("Organization Admins can only reactivate Members."),
            {
              statusCode: 403,
            },
          );
        }

        if (targetMembership.status !== "inactive") {
          throw Object.assign(
            new Error("Only inactive organization members can be reactivated."),
            {
              statusCode: 409,
            },
          );
        }

        const reactivatedMembership =
          await OrganizationMembership.findOneAndUpdate(
            {
              _id: targetMembership._id,
              organizationId: organization._id,
              status: "inactive",
              role: targetMembership.role,
            },
            {
              status: "active",
              joinedAt: new Date(),
              leftAt: null,
            },
            {
              returnDocument: "after",
              runValidators: true,
              session,
            },
          );

        if (!reactivatedMembership) {
          throw Object.assign(
            new Error(
              "The organization membership changed before reactivation completed.",
            ),
            {
              statusCode: 409,
            },
          );
        }

        await createOrganizationActivityEvent({
          organizationId: organization._id,
          actorId: req.user._id,
          eventType: "organization_member_reactivated",
          entityType: "organization_membership",
          entityId: reactivatedMembership._id,
          metadata: {
            memberUserId: reactivatedMembership.userId,
            role: reactivatedMembership.role,
            previousStatus: "inactive",
            status: "active",
            joinedAt: reactivatedMembership.joinedAt,
          },
          session,
        });

        reactivatedMembershipId = reactivatedMembership._id;
      });

      const populatedMembership = await OrganizationMembership.findById(
        reactivatedMembershipId,
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

      return res.status(200).json({
        message: "Organization member reactivated.",
        member: formatOrganizationMember(populatedMembership),
      });
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({
          error: error.message,
        });
      }

      if (error instanceof mongoose.Error.ValidationError) {
        return res.status(400).json({
          error: "Validation failed.",
          fields: getMongooseValidationFields(error),
        });
      }

      console.error("Organization member reactivation route error:", error);

      return res.status(500).json({
        error:
          "Unable to reactivate the organization member. Please try again.",
      });
    } finally {
      await session.endSession();
    }
  },
);

router.patch(
  "/:organizationId/ownership/transfer",
  requireAuth,
  requireOrganizationMembership,
  requireOrganizationRole("owner"),
  requireOrganizationWritable,
  async (req, res) => {
    const membershipId =
      typeof req.body?.membershipId === "string"
        ? req.body.membershipId.trim()
        : "";

    if (!mongoose.Types.ObjectId.isValid(membershipId)) {
      return res.status(400).json({
        error: "Validation failed.",
        fields: {
          membershipId: "Enter a valid organization membership ID.",
        },
      });
    }

    const { organization, membership: currentOwnerMembership } =
      req.organizationAccess;

    if (membershipId === currentOwnerMembership._id.toString()) {
      return res.status(409).json({
        error: "This membership already owns the organization.",
      });
    }

    const session = await mongoose.startSession();

    let previousOwnerMembershipId;
    let newOwnerMembershipId;

    try {
      await session.withTransaction(async () => {
        const targetMembership = await OrganizationMembership.findOne({
          _id: membershipId,
          organizationId: organization._id,
        })
          .session(session)
          .lean();

        if (!targetMembership) {
          throw Object.assign(new Error("Organization member not found."), {
            statusCode: 404,
          });
        }

        if (targetMembership.status !== "active") {
          throw Object.assign(
            new Error(
              "Ownership can only be transferred to an active organization member.",
            ),
            {
              statusCode: 409,
            },
          );
        }

        if (targetMembership.role === "owner") {
          throw Object.assign(
            new Error("This member already owns the organization."),
            {
              statusCode: 409,
            },
          );
        }

        const previousOwner = await OrganizationMembership.findOneAndUpdate(
          {
            _id: currentOwnerMembership._id,
            organizationId: organization._id,
            userId: req.user._id,
            role: "owner",
            status: "active",
          },
          {
            role: "admin",
          },
          {
            returnDocument: "after",
            runValidators: true,
            session,
          },
        );

        if (!previousOwner) {
          throw Object.assign(
            new Error(
              "Organization ownership changed before the transfer completed.",
            ),
            {
              statusCode: 409,
            },
          );
        }

        const newOwner = await OrganizationMembership.findOneAndUpdate(
          {
            _id: targetMembership._id,
            organizationId: organization._id,
            status: "active",
            role: targetMembership.role,
          },
          {
            role: "owner",
          },
          {
            returnDocument: "after",
            runValidators: true,
            session,
          },
        );

        if (!newOwner) {
          throw Object.assign(
            new Error(
              "The target membership changed before the transfer completed.",
            ),
            {
              statusCode: 409,
            },
          );
        }

        previousOwnerMembershipId = previousOwner._id;
        newOwnerMembershipId = newOwner._id;
      });

      const [previousOwner, newOwner] = await Promise.all([
        OrganizationMembership.findById(previousOwnerMembershipId)
          .populate({
            path: "userId",
            select: "fullName email",
          })
          .populate({
            path: "invitedBy",
            select: "fullName email",
          })
          .lean(),
        OrganizationMembership.findById(newOwnerMembershipId)
          .populate({
            path: "userId",
            select: "fullName email",
          })
          .populate({
            path: "invitedBy",
            select: "fullName email",
          })
          .lean(),
      ]);

      return res.status(200).json({
        message: "Organization ownership transferred successfully.",
        previousOwner: formatOrganizationMember(previousOwner),
        newOwner: formatOrganizationMember(newOwner),
      });
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({
          error: error.message,
        });
      }

      if (error instanceof mongoose.Error.ValidationError) {
        return res.status(400).json({
          error: "Validation failed.",
          fields: getMongooseValidationFields(error),
        });
      }

      if (error?.code === 11000) {
        return res.status(409).json({
          error:
            "The organization already has an active Owner. Ownership was not transferred.",
        });
      }

      console.error("Organization ownership transfer route error:", error);

      return res.status(500).json({
        error: "Unable to transfer organization ownership. Please try again.",
      });
    } finally {
      await session.endSession();
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
    validationErrors.name = "Organization name cannot exceed 120 characters.";
  }

  if (description.length > 1000) {
    validationErrors.description =
      "Organization description cannot exceed 1000 characters.";
  }

  if (slug.length < 2) {
    validationErrors.slug =
      "Organization slug must contain at least 2 characters.";
  } else if (slug.length > 120) {
    validationErrors.slug = "Organization slug cannot exceed 120 characters.";
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
