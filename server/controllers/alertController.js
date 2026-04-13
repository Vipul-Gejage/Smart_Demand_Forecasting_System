const Alert = require("../models/Alert");

// ⚠️ Get Alerts
exports.getAlerts = async (req, res) => {
  try {
    const { status, severity, type, storeId, productId, limit = 50 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (severity) query.severity = severity;
    if (type) query.type = type;
    if (storeId) query.storeId = storeId;
    if (productId) query.productId = productId;

    const items = await Alert.find(query)
      .populate("storeId")
      .populate("productId")
      .sort({ createdAt: -1 })
      .limit(Math.min(Number(limit) || 50, 200));

    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Update Alert Status
exports.updateAlertStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["new", "acknowledged", "resolved"].includes(status)) {
      return res.status(400).json({ error: "Invalid alert status." });
    }

    const updated = await Alert.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ error: "Alert not found." });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};