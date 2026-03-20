const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");

const Entry = require("./models/Entry");

const app = express();
const PORT = 3001;

mongoose
  .connect("mongodb://127.0.0.1:27017/skillforge_db")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.send({ status: "OK" });
});

// GitHub route
app.get("/github/:username", async (req, res) => {
  const { username } = req.params;

  try {
    const userRes = await fetch(`https://api.github.com/users/${username}`);

    if (!userRes.ok) {
      return res.status(404).json({ error: "User not found" });
    }

    const userData = await userRes.json();

    const repoRes = await fetch(userData.repos_url);
    const repoData = await repoRes.json();

    res.json({
      user: userData,
      repos: repoData.slice(0, 5),
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// POST /entries
app.post("/entries", async (req, res) => {
  try {
    console.log("BODY:", req.body);

    const { topic, hours } = req.body;

    if (!topic || topic.trim() === "" || typeof hours !== "number") {
      return res.status(400).json({ error: "Invalid input data" });
    }

    const entry = await Entry.create(req.body);

    res.status(201).json(entry);
  } catch (err) {
    console.error("ERROR:", err);
    res.status(400).json({
      error: "Failed to create entry",
      details: err.message,
    });
  }
});

// GET /entries
app.get("/entries", async (req, res) => {
  try {
    const entries = await Entry.find().sort({ date: -1 });
    res.json(entries);
  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ error: "Failed to fetch entries" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});