const Inventory = require("../models/Inventory");

// GET all inventory
exports.getInventory = async (req, res) => {
  try {
    const items = await Inventory.find();
    res.json(items); // MUST BE ARRAY
  } catch (err) {
    res.status(500).json({ message: "Error fetching inventory" });
  }
};

// ADD item
exports.addInventory = async (req, res) => {
  try {
    const { name, qty } = req.body;

    const item = new Inventory({ name, qty });
    await item.save();

    res.json(item);
  } catch (err) {
    res.status(500).json({ message: "Error adding item" });
  }
};

// DELETE item
exports.deleteInventory = async (req, res) => {
  try {
    await Inventory.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting" });
  }
};