const Inventory = require("../models/Inventory");
const Product = require("../models/Product");
const Store = require("../models/Store");

// ➕ Create Inventory
exports.addInventory = async (req, res) => {
  try {
    const { productId, quantity, storeId } = req.body;

    // Validate product exists
    const productExists = await Product.findById(productId);
    if (!productExists) {
      return res.status(400).json({ error: "Invalid product. Must select a valid product." });
    }

    // Validate store exists
    const storeExists = await Store.findById(storeId);
    if (!storeExists) {
      return res.status(400).json({ error: "Invalid store." });
    }

    // Check if inventory already exists for this product and store
    let existing = await Inventory.findOne({ productId, storeId });
    if (existing) {
      // If it exists, update the quantity (add to existing)
      existing.quantity += Number(quantity);
      existing.lastUpdated = Date.now();
      await existing.save();
      return res.status(200).json(existing);
    }

    const data = await Inventory.create({ productId, quantity, storeId });
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📥 Get All Inventory
exports.getInventory = async (req, res) => {
  try {
    const data = await Inventory.find()
      .populate("productId")
      .populate("storeId")
      .sort({ lastUpdated: -1 });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✏️ Update Inventory
exports.updateInventory = async (req, res) => {
  try {
    const { quantity, increment } = req.body;

    let updateData = { lastUpdated: Date.now() };

    if (increment !== undefined) {
      // Increment or decrement quantity
      const item = await Inventory.findById(req.params.id);
      if (!item) {
        return res.status(404).json({ error: "Inventory item not found" });
      }
      updateData.quantity = item.quantity + increment;
      if (updateData.quantity < 0) {
        return res.status(400).json({ error: "Quantity cannot be negative" });
      }
    } else if (quantity !== undefined) {
      updateData.quantity = quantity;
      if (updateData.quantity < 0) {
        return res.status(400).json({ error: "Quantity cannot be negative" });
      }
    }

    const data = await Inventory.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!data) {
      return res.status(404).json({ error: "Inventory item not found" });
    }

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

// 📦 Get Products (for dropdown)
exports.getProducts = async (req, res) => {
  try {
    const data = await Product.find().sort({ product_name: 1 });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🏪 Get Stores (for dropdown)
exports.getStores = async (req, res) => {
  try {
    const data = await Store.find().sort({ store_name: 1 });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};