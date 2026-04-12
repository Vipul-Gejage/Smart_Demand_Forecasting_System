const Sales = require("../models/Sales");

// ⚠️ Get Alerts
exports.getAlerts = async (req, res) => {
  try {
    const alerts = [];

    // 🔴 Stockout Risk (low inventory)
    const lowStock = await Sales.find({
      inventory_on_hand: { $lt: 20 }
    }).limit(10);

    lowStock.forEach(item => {
      alerts.push({
        type: "stockout",
        message: `Low stock for product ${item.product_id} in store ${item.store_id}`,
        level: "high"
      });
    });

    // 🟡 Overstock
    const overStock = await Sales.find({
      inventory_on_hand: { $gt: 200 }
    }).limit(10);

    overStock.forEach(item => {
      alerts.push({
        type: "overstock",
        message: `Overstock for product ${item.product_id} in store ${item.store_id}`,
        level: "medium"
      });
    });

    // 🔥 Demand Spike (high sales)
    const spikes = await Sales.find({
      units_sold: { $gt: 100 }
    }).limit(10);

    spikes.forEach(item => {
      alerts.push({
        type: "demand_spike",
        message: `High demand for product ${item.product_id}`,
        level: "high"
      });
    });

    res.json(alerts);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};