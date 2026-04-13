const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["stockout", "overstock", "demand_spike", "inventory_gap"],
      required: true,
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["new", "acknowledged", "resolved"],
      default: "new",
    },
    message: { type: String, required: true },
    store_id: { type: Number, required: true },
    product_id: { type: Number, required: true },
    stockout_risk: { type: Number, default: 0 },
    overstock_risk: { type: Number, default: 0 },
    predicted_units_sold: { type: Number, default: 0 },
    recommended_inventory_level: { type: Number, default: 0 },
    inventory_gap: { type: Number, default: 0 },
    anomaly_score: { type: Number, default: 0 },
    ai_reason: { type: String, default: "" },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Alert", alertSchema);
