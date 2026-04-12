const mongoose = require("mongoose");

const weatherSchema = new mongoose.Schema({
  date: String,
  city: String,
  avg_temp: Number,
  rainfall_mm: Number,
  humidity: Number,
  weather_condition: String
});

module.exports = mongoose.model("Weather", weatherSchema);