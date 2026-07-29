const mongoose = require("mongoose");

const avatarSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      trim: true,
      maxLength: [2048, "Avatar URL cannot exceed 2048 characters."],
    },

    source: {
      type: String,
      enum: {
        values: ["github", "upload"],
        message: "Avatar source must be GitHub or Upload.",
      },
    },
  },
  {
    _id: false,
  },
);

const githubIdentitySchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      trim: true,
    },

    username: {
      type: String,
      trim: true,
      maxLength: [100, "GitHub username cannot exceed 100 characters."],
    },

    profileUrl: {
      type: String,
      trim: true,
      maxLength: [2048, "GitHub profile URL cannot exceed 2048 characters."],
    },

    avatarUrl: {
      type: String,
      trim: true,
      maxLength: [2048, "GitHub avatar URL cannot exceed 2048 characters."],
    },

    connectedAt: {
      type: Date,
    },

    lastSyncedAt: {
      type: Date,
    },
  },
  {
    _id: false,
  },
);

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required."],
      trim: true,
      minLength: [2, "Full name must contain at least 2 characters."],
      maxLength: [80, "Full name cannot exceed 80 characters."],
    },

    email: {
      type: String,
      required: [true, "Email address is required."],
      trim: true,
      lowercase: true,
      unique: true,
      maxLength: [254, "Email address is too long."],
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email address."],
    },

    passwordHash: {
      type: String,
      required: [true, "Password hash is required."],
      select: false,
    },

    membership: {
      type: String,
      enum: {
        values: ["free", "pro", "team"],
        message: "Membership must be Free, Pro, or Team.",
      },
      default: "free",
      required: true,
    },

    avatar: {
      type: avatarSchema,
      default: undefined,
    },

    github: {
      type: githubIdentitySchema,
      default: undefined,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

userSchema.index(
  {
    "github.userId": 1,
  },
  {
    unique: true,
    sparse: true,
  },
);

userSchema.set("toJSON", {
  transform: (_document, returnedObject) => {
    delete returnedObject.passwordHash;

    return returnedObject;
  },
});

module.exports = mongoose.model("User", userSchema);
