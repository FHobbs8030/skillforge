const express = require("express");

const app = express();
const PORT = 3001;

app.get("/health", (req, res) => {
  res.send({ status: "OK" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});