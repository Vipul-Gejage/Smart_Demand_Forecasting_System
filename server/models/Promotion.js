const mongoose = require("mongoose");

const promotionSchema = new mongoose.Schema({
  product: String,
  discount: Number,
  date: String,
});

module.exports = mongoose.model("Promotion", promotionSchema);