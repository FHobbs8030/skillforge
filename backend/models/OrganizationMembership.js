const mongoose = require("mongoose");

const organizationMembershipSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: [true, "Organization is required."],
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Organization member is required."],
    },

    role: {
      type: String,
      enum: {
        values: ["owner", "admin", "member"],
        message: "Organization role must be owner, admin, or member.",
      },
      default: "member",
      required: true,
    },

    status: {
      type: String,
      enum: {
        values: ["invited", "active", "inactive", "removed"],
        message:
          "Membership status must be invited, active, inactive, or removed.",
      },
      default: "invited",
      required: true,
    },

    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    invitedAt: {
      type: Date,
      default: null,
    },

    joinedAt: {
      type: Date,
      default: null,
    },

    leftAt: {
      type: Date,
      default: null,
    },
  },
  {
    collection: "organizationMemberships",
    timestamps: true,
    versionKey: false,
  },
);

organizationMembershipSchema.index(
  {
    organizationId: 1,
    userId: 1,
  },
  {
    unique: true,
  },
);

organizationMembershipSchema.index({
  userId: 1,
  status: 1,
  updatedAt: -1,
});

organizationMembershipSchema.index({
  organizationId: 1,
  role: 1,
  status: 1,
});

module.exports = mongoose.model(
  "OrganizationMembership",
  organizationMembershipSchema,
);
