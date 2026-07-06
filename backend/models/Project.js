const mongoose = require("mongoose");

const repositorySchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      enum: {
        values: ["github"],
        message: "Repository provider must be GitHub.",
      },
    },

    owner: {
      type: String,
      trim: true,
      maxLength: [100, "Repository owner cannot exceed 100 characters."],
    },

    name: {
      type: String,
      trim: true,
      maxLength: [100, "Repository name cannot exceed 100 characters."],
    },

    url: {
      type: String,
      trim: true,
      maxLength: [500, "Repository URL cannot exceed 500 characters."],
    },
  },
  {
    _id: false,
  },
);

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Project name is required."],
      trim: true,
      minLength: [2, "Project name must contain at least 2 characters."],
      maxLength: [120, "Project name cannot exceed 120 characters."],
    },

    description: {
      type: String,
      trim: true,
      maxLength: [2000, "Project description cannot exceed 2000 characters."],
      default: "",
    },

    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Project owner is required."],
    },

    status: {
      type: String,
      enum: {
        values: ["planned", "active", "paused", "completed", "archived"],
        message:
          "Project status must be planned, active, paused, completed, or archived.",
      },
      default: "active",
      required: true,
    },

    visibility: {
      type: String,
      enum: {
        values: ["private", "team", "public"],
        message: "Project visibility must be private, team, or public.",
      },
      default: "private",
      required: true,
    },

    repository: {
      type: repositorySchema,
      default: undefined,
    },

    archivedAt: {
      type: Date,
      default: null,
    },
  },
  {
    collection: "projects",
    timestamps: true,
    versionKey: false,
  },
);

projectSchema.index({
  ownerId: 1,
  status: 1,
  updatedAt: -1,
});

projectSchema.index({
  "repository.provider": 1,
  "repository.owner": 1,
  "repository.name": 1,
});

module.exports = mongoose.model("Project", projectSchema);
