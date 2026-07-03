const mongoose = require("mongoose");

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
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

userSchema.set("toJSON", {
  transform: (_document, returnedObject) => {
    delete returnedObject.passwordHash;

    return returnedObject;
  },
});

module.exports = mongoose.model("User", userSchema);
