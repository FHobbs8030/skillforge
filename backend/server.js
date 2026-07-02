const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

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
  res.json({ status: "OK" });
});

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
      { headers },
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

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
