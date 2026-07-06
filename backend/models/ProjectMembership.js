const mongoose = require("mongoose");

const projectMembershipSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project is required."],
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Project member is required."],
    },

    role: {
      type: String,
      enum: {
        values: ["owner", "host", "collaborator", "viewer"],
        message: "Project role must be owner, host, collaborator, or viewer.",
      },
      default: "collaborator",
      required: true,
    },

    status: {
      type: String,
      enum: {
        values: ["invited", "active", "inactive", "removed"],
        message:
          "Membership status must be invited, active, inactive, or removed.",
      },
      default: "active",
      required: true,
    },

    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    joinedAt: {
      type: Date,
      default: Date.now,
    },

    leftAt: {
      type: Date,
      default: null,
    },
  },
  {
    collection: "projectMemberships",
    timestamps: true,
    versionKey: false,
  },
);

projectMembershipSchema.index(
  {
    projectId: 1,
    userId: 1,
  },
  {
    unique: true,
  },
);

projectMembershipSchema.index({
  userId: 1,
  status: 1,
  updatedAt: -1,
});

projectMembershipSchema.index({
  projectId: 1,
  role: 1,
  status: 1,
});

module.exports = mongoose.model(
  "ProjectMembership",
  projectMembershipSchema,
);
