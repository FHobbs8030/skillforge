const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Organization name is required."],
      trim: true,
      minLength: [
        2,
        "Organization name must contain at least 2 characters.",
      ],
      maxLength: [
        120,
        "Organization name cannot exceed 120 characters.",
      ],
    },

    slug: {
      type: String,
      required: [true, "Organization slug is required."],
      trim: true,
      lowercase: true,
      minLength: [
        2,
        "Organization slug must contain at least 2 characters.",
      ],
      maxLength: [
        120,
        "Organization slug cannot exceed 120 characters.",
      ],
      match: [
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Organization slug may contain lowercase letters, numbers, and hyphens.",
      ],
    },

    description: {
      type: String,
      trim: true,
      maxLength: [
        1000,
        "Organization description cannot exceed 1000 characters.",
      ],
      default: "",
    },

    createdById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Organization creator is required."],
      immutable: true,
    },

    status: {
      type: String,
      enum: {
        values: ["active", "archived"],
        message: "Organization status must be active or archived.",
      },
      default: "active",
      required: true,
    },

    archivedAt: {
      type: Date,
      default: null,
    },
  },
  {
    collection: "organizations",
    timestamps: true,
    versionKey: false,
  },
);

organizationSchema.index(
  {
    slug: 1,
  },
  {
    unique: true,
  },
);

organizationSchema.index({
  status: 1,
  updatedAt: -1,
});

module.exports = mongoose.model("Organization", organizationSchema);