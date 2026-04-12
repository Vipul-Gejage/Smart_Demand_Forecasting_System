const mongoose = require("mongoose");

const forecastSchema = new mongoose.Schema({
  date: String,
  store_id: Number,
  product_id: Number,
  predicted_units_sold: Number,
  recommended_inventory_level: Number
}, {
  timestamps: true   // 🔥 good practice
});

module.exports = mongoose.model("Forecast", forecastSchema);