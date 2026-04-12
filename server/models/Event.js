const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  date: String,
  event_name: String,
  event_type: String,
  city: String,
  impact_level: String
});

module.exports = mongoose.model("Event", eventSchema);