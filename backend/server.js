const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("./models/User");
const requireAuth = require("./middleware/auth");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

const BCRYPT_ROUNDS = 10;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_MEMBERSHIPS = new Set(["free", "pro", "team"]);

function createAuthToken(userId) {
  return jwt.sign({}, process.env.JWT_SECRET, {
    subject: userId.toString(),
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
    algorithm: "HS256",
  });
}

const allowedOrigins = ["https://adorable-granita-db1df3.netlify.app"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      const isLocalDevelopment =
        /^http:\/\/localhost:\d+$/.test(origin) ||
        /^http:\/\/127\.0\.0\.1:\d+$/.test(origin);

      const isAllowedDeployment = allowedOrigins.includes(origin);

      if (isLocalDevelopment || isAllowedDeployment) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked origin: ${origin}`));
    },

    methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],

    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("SkillForge API is running");
});

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
  });
});

/* =========================
   AUTHENTICATION
========================= */

app.post("/auth/signup", async (req, res) => {
  const fullName =
    typeof req.body.fullName === "string" ? req.body.fullName.trim() : "";

  const email =
    typeof req.body.email === "string"
      ? req.body.email.trim().toLowerCase()
      : "";

  const password =
    typeof req.body.password === "string" ? req.body.password : "";

  const membership =
    typeof req.body.membership === "string"
      ? req.body.membership.trim().toLowerCase()
      : "free";

  const validationErrors = {};

  if (fullName.length < 2) {
    validationErrors.fullName = "Full name must contain at least 2 characters.";
  } else if (fullName.length > 80) {
    validationErrors.fullName = "Full name cannot exceed 80 characters.";
  }

  if (!email) {
    validationErrors.email = "Email address is required.";
  } else if (!EMAIL_PATTERN.test(email)) {
    validationErrors.email = "Enter a valid email address.";
  } else if (email.length > 254) {
    validationErrors.email = "Email address is too long.";
  }

  if (password.length < 8) {
    validationErrors.password = "Password must contain at least 8 characters.";
  } else if (bcrypt.truncates(password)) {
    validationErrors.password =
      "Password is too long. Use no more than 72 UTF-8 bytes.";
  }

  if (!ALLOWED_MEMBERSHIPS.has(membership)) {
    validationErrors.membership = "Membership must be Free, Pro, or Team.";
  }

  if (Object.keys(validationErrors).length > 0) {
    return res.status(400).json({
      error: "Validation failed.",
      fields: validationErrors,
    });
  }

  try {
    const existingUser = await User.findOne({
      email,
    }).lean();

    if (existingUser) {
      return res.status(409).json({
        error: "An account with this email address already exists.",
        fields: {
          email: "An account with this email address already exists.",
        },
      });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const user = await User.create({
      fullName,
      email,
      passwordHash,
      membership,
    });

    return res.status(201).json({
      message: "Account created successfully.",
      user,
    });
  } catch (error) {
    /*
     * The pre-check above improves the response, but the unique
     * MongoDB index remains the final protection against two
     * simultaneous requests using the same email.
     */
    if (error?.code === 11000) {
      return res.status(409).json({
        error: "An account with this email address already exists.",
        fields: {
          email: "An account with this email address already exists.",
        },
      });
    }

    if (error instanceof mongoose.Error.ValidationError) {
      const fields = Object.fromEntries(
        Object.entries(error.errors).map(([fieldName, fieldError]) => [
          fieldName,
          fieldError.message,
        ]),
      );

      return res.status(400).json({
        error: "Validation failed.",
        fields,
      });
    }

    console.error("Signup route error:", error);

    return res.status(500).json({
      error: "Unable to create the account. Please try again.",
    });
  }
});

/* =========================
   SIGN IN
========================= */

app.post("/auth/signin", async (req, res) => {
  const email =
    typeof req.body.email === "string"
      ? req.body.email.trim().toLowerCase()
      : "";

  const password =
    typeof req.body.password === "string" ? req.body.password : "";

  const validationErrors = {};

  if (!email) {
    validationErrors.email = "Email address is required.";
  } else if (!EMAIL_PATTERN.test(email)) {
    validationErrors.email = "Enter a valid email address.";
  }

  if (!password) {
    validationErrors.password = "Password is required.";
  }

  if (Object.keys(validationErrors).length > 0) {
    return res.status(400).json({
      error: "Validation failed.",
      fields: validationErrors,
    });
  }

  try {
    const user = await User.findOne({
      email,
    }).select("+passwordHash");

    if (!user) {
      return res.status(401).json({
        error: "Invalid email or password.",
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      return res.status(401).json({
        error: "Invalid email or password.",
      });
    }

    const token = createAuthToken(user._id);

    const safeUser = user.toObject();

    delete safeUser.passwordHash;

    return res.status(200).json({
      message: "Signed in successfully.",
      token,
      user: safeUser,
    });
  } catch (error) {
    console.error("Signin route error:", error);

    return res.status(500).json({
      error: "Unable to sign in. Please try again.",
    });
  }
});

/* =========================
   CURRENT USER
========================= */

app.get("/auth/me", requireAuth, (req, res) => {
  return res.status(200).json({
    user: req.user,
  });
});

/* =========================
   GITHUB INTEGRATION
========================= */

app.get("/github/:username", async (req, res) => {
  const username = req.params.username.trim();

  if (!username) {
    return res.status(400).json({
      error: "A GitHub username is required.",
    });
  }

  try {
    const headers = {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    };

    const userResponse = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}`,
      {
        headers,
      },
    );

    const userData = await userResponse.json();

    if (!userResponse.ok) {
      return res.status(userResponse.status).json({
        error: userData.message || "GitHub API error",
      });
    }

    const repositoryResponse = await fetch(userData.repos_url, {
      headers,
    });

    const repositoryData = await repositoryResponse.json();

    if (!repositoryResponse.ok) {
      return res.status(repositoryResponse.status).json({
        error: repositoryData.message || "Unable to fetch repositories",
      });
    }

    return res.json({
      user: userData,
      repos: repositoryData.slice(0, 5),
    });
  } catch (error) {
    console.error("GitHub route error:", error);

    return res.status(500).json({
      error: "Server error",
    });
  }
});

/* =========================
   SERVER STARTUP
========================= */

async function startServer() {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is required.");
    }

    await mongoose.connect(process.env.MONGO_URI);

    /*
     * Ensure MongoDB has created the unique email index before
     * accepting signup requests.
     */
    await User.init();

    console.log("MongoDB connected");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup error:", error);

    process.exit(1);
  }
}

startServer();
