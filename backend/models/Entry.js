const mongoose = require("mongoose");

const entrySchema = new mongoose.Schema({
  topic: {
    type: String,
    required: true,
  },
  hours: {
    type: Number,
    required: true,
  },
  notes: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const Entry = mongoose.model("Entry", entrySchema);

module.exports = Entry;