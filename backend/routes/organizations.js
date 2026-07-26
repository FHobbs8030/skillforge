const express = require("express");
const mongoose = require("mongoose");

const Organization = require("../models/Organization");
const OrganizationMembership = require("../models/OrganizationMembership");

const requireAuth = require("../middleware/auth");
const {
  requireOrganizationMembership,
  requireOrganizationRole,
  requireOrganizationWritable,
} = require("../middleware/organizationAccess");

const router = express.Router();

const ORGANIZATION_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

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