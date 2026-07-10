const mongoose = require("mongoose");

const projectTaskSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project is required."],
    },

    title: {
      type: String,
      required: [true, "Task title is required."],
      trim: true,
      minLength: [2, "Task title must contain at least 2 characters."],
      maxLength: [160, "Task title cannot exceed 160 characters."],
    },

    description: {
      type: String,
      trim: true,
      maxLength: [4000, "Task description cannot exceed 4000 characters."],
      default: "",
    },

    status: {
      type: String,
      enum: {
        values: [
          "backlog",
          "todo",
          "in_progress",
          "review",
          "completed",
          "archived",
        ],
        message:
          "Task status must be backlog, todo, in progress, review, completed, or archived.",
      },
      default: "backlog",
      required: true,
    },

    priority: {
      type: String,
      enum: {
        values: ["low", "medium", "high", "urgent"],
        message: "Task priority must be low, medium, high, or urgent.",
      },
      default: "medium",
      required: true,
    },

    assigneeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    createdById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Task creator is required."],
    },

    labels: {
      type: [
        {
          type: String,
          trim: true,
          maxLength: [40, "Task labels cannot exceed 40 characters."],
        },
      ],
      default: [],
    },

    dueDate: {
      type: Date,
      default: null,
    },

    position: {
      type: Number,
      min: [0, "Task position cannot be negative."],
      default: 0,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    archivedAt: {
      type: Date,
      default: null,
    },
  },
  {
    collection: "projectTasks",
    timestamps: true,
    versionKey: false,
  },
);

projectTaskSchema.index({
  projectId: 1,
  status: 1,
  position: 1,
  updatedAt: -1,
});

projectTaskSchema.index({
  projectId: 1,
  assigneeId: 1,
  status: 1,
  updatedAt: -1,
});

projectTaskSchema.index({
  projectId: 1,
  dueDate: 1,
  status: 1,
});

projectTaskSchema.index({
  createdById: 1,
  createdAt: -1,
});

module.exports = mongoose.model("ProjectTask", projectTaskSchema);
