const Inventory = require("../models/Inventory");

// ➕ Add Inventory
exports.addInventory = async (req, res) => {
  try {
    const data = new Inventory(req.body);
    await data.save();
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📥 Get All Inventory
exports.getInventory = async (req, res) => {
  try {
    const data = await Inventory.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✏️ Update Inventory
exports.updateInventory = async (req, res) => {
  try {
    const data = await Inventory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ❌ Delete Inventory
exports.deleteInventory = async (req, res) => {
  try {
    await Inventory.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};