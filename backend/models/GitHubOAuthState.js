const mongoose = require("mongoose");

const githubOAuthStateSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    stateHash: {
      type: String,
      required: true,
      unique: true,
      maxlength: 128,
    },

    codeVerifier: {
      type: String,
      required: true,
      maxlength: 256,
    },

    redirectUri: {
      type: String,
      required: true,
      maxlength: 2048,
    },

    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

githubOAuthStateSchema.index(
  {
    expiresAt: 1,
  },
  {
    expireAfterSeconds: 0,
  },
);

module.exports = mongoose.model(
  "GitHubOAuthState",
  githubOAuthStateSchema,
);
