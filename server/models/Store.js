const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema({
  store_id: Number,
  store_name: String,
  city: String,
  state: String,
  store_type: String,
  store_size_sqft: Number
});

module.exports = mongoose.model("Store", storeSchema);