const mongoose = require("mongoose");

const testInputSchema = new mongoose.Schema({
  date: String,
  store_id: Number,
  product_id: Number
});

module.exports = mongoose.model("TestInput", testInputSchema);