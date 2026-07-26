const mongoose = require("mongoose");

const Organization = require("../models/Organization");
const OrganizationMembership = require("../models/OrganizationMembership");

async function requireOrganizationMembership(req, res, next) {
  const { organizationId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(organizationId)) {
    return res.status(400).json({
      error: "Invalid organization ID.",
    });
  }

  try {
    const membership = await OrganizationMembership.findOne({
      organizationId,
      userId: req.user._id,
      status: "active",
    }).lean();

    if (!membership) {
      return res.status(404).json({
        error: "Organization not found.",
      });
    }

    const organization = await Organization.findById(organizationId).lean();

    if (!organization) {
      return res.status(404).json({
        error: "Organization not found.",
      });
    }

    req.organizationAccess = {
      organization,
      membership,
    };

    return next();
  } catch (error) {
    console.error("Organization access middleware error:", error);

    return res.status(500).json({
      error: "Unable to verify organization access. Please try again.",
    });
  }
}

function requireOrganizationRole(...allowedRoles) {
  const allowedRoleSet = new Set(allowedRoles);

  return (req, res, next) => {
    const role = req.organizationAccess?.membership?.role;

    if (!role || !allowedRoleSet.has(role)) {
      return res.status(403).json({
        error:
          "You do not have permission to perform this organization action.",
      });
    }

    return next();
  };
}

function requireOrganizationWritable(req, res, next) {
  const organization = req.organizationAccess?.organization;

  if (!organization) {
    return res.status(500).json({
      error: "Organization access context is unavailable.",
    });
  }

  if (organization.status === "archived") {
    return res.status(409).json({
      error: "Archived organizations cannot be modified.",
    });
  }

  return next();
}

module.exports = {
  requireOrganizationMembership,
  requireOrganizationRole,
  requireOrganizationWritable,
};
