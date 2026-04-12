const mongoose = require("mongoose");

const realtimeSchema = new mongoose.Schema({
  timestamp: String,
  store_id: Number,
  product_id: Number,
  signal_type: String,
  signal_strength: Number,
  notes: String
});

module.exports = mongoose.model("Realtime", realtimeSchema);