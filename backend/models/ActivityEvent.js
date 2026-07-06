const mongoose = require("mongoose");

const EVENT_TYPE_PATTERN = /^[a-z][a-z0-9_]*$/;

const activityEventSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project is required."],
    },

    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    eventType: {
      type: String,
      required: [true, "Event type is required."],
      trim: true,
      maxLength: [80, "Event type cannot exceed 80 characters."],
      match: [
        EVENT_TYPE_PATTERN,
        "Event type must use lowercase snake_case characters.",
      ],
    },

    source: {
      type: String,
      enum: {
        values: ["skillforge", "github", "google", "system"],
        message: "Event source must be SkillForge, GitHub, Google, or system.",
      },
      default: "skillforge",
      required: true,
    },

    entityType: {
      type: String,
      trim: true,
      maxLength: [80, "Entity type cannot exceed 80 characters."],
      default: "",
    },

    entityId: {
      type: String,
      trim: true,
      maxLength: [255, "Entity ID cannot exceed 255 characters."],
      default: "",
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({}),
    },

    occurredAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    collection: "activityEvents",
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
    versionKey: false,
  },
);

activityEventSchema.index({
  projectId: 1,
  occurredAt: -1,
});

activityEventSchema.index({
  projectId: 1,
  eventType: 1,
  occurredAt: -1,
});

activityEventSchema.index({
  actorId: 1,
  occurredAt: -1,
});

module.exports = mongoose.model("ActivityEvent", activityEventSchema);
