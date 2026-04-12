const mongoose = require("mongoose");

const promotionSchema = new mongoose.Schema({
  date: String,
  store_id: Number,
  product_id: Number,
  promo_type: String,
  discount_pct: Number,
  display_flag: Boolean,
  campaign_name: String
});

module.exports = mongoose.model("Promotion", promotionSchema);