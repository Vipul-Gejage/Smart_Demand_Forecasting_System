const mongoose = require("mongoose");

const salesSchema = new mongoose.Schema({
  date: String,
  store_id: Number,
  product_id: Number,
  units_sold: Number,
  sell_price: Number,
  inventory_on_hand: Number,
  stockout_flag: Boolean
});

module.exports = mongoose.model("Sales", salesSchema);