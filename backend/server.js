const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const Entry = require("./models/Entry");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 3001;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (origin.includes("localhost:5173") || origin.includes("netlify.app")) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
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
  res.send({ status: "OK" });
});

app.get("/github/:username", async (req, res) => {
  const { username } = req.params;

  try {
    const headers = {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    };

    const userRes = await fetch(`https://api.github.com/users/${username}`, {
      headers,
    });
    const data = await userRes.json();

    if (!userRes.ok) {
      return res.status(userRes.status).json({
        error: data.message || "GitHub API error",
      });
    }

    const repoRes = await fetch(data.repos_url, { headers });
    const repoData = await repoRes.json();

    res.json({
      user: data,
      repos: repoData.slice(0, 5),
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/entries", async (req, res) => {
  try {
    const { topic, hours } = req.body;

    if (!topic || topic.trim() === "" || typeof hours !== "number") {
      return res.status(400).json({ error: "Invalid input data" });
    }

    const entry = await Entry.create(req.body);
    res.status(201).json(entry);
  } catch (err) {
    res.status(400).json({
      error: "Failed to create entry",
      details: err.message,
    });
  }
});

app.get("/entries", async (req, res) => {
  try {
    const entries = await Entry.find().sort({ date: -1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch entries" });
  }
});

app.delete("/entries/:id", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ID format" });
  }

  try {
    const deletedEntry = await Entry.findByIdAndDelete(id);

    if (!deletedEntry) {
      return res.status(404).json({ message: "Entry not found" });
    }

    res.json({ message: "Entry deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
