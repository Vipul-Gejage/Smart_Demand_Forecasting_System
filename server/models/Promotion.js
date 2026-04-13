const mongoose = require("mongoose");

const promotionSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Store",
    required: true,
  },
  promo_type: String,
  discount_pct: Number,
  display_flag: Boolean,
  campaign_name: String
});

module.exports = mongoose.model("Promotion", promotionSchema);