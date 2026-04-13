const mongoose = require("mongoose");

const forecastSchema = new mongoose.Schema({
  date: String,
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Store",
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  predicted_units_sold: Number,
  recommended_inventory_level: Number,
  explanation: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  }
}, {
  timestamps: true   // 🔥 good practice
});

module.exports = mongoose.model("Forecast", forecastSchema);