const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  product_id: Number,
  product_name: String,
  category: String,
  subcategory: String,
  brand: String,
  mrp: Number,
  shelf_life_days: Number,
  lead_time_days: Number
});

module.exports = mongoose.model("Product", productSchema);