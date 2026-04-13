const mongoose = require("mongoose");

const salesSchema = new mongoose.Schema({
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
  units_sold: Number,
  sell_price: Number,
  inventory_on_hand: Number,
  stockout_flag: Boolean
});

module.exports = mongoose.model("Sales", salesSchema);