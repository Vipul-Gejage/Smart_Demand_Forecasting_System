const Promotion = require("../models/Promotion");
const Product = require("../models/Product");
const Store = require("../models/Store");

// ➕ Create Promotion
exports.addPromotion = async (req, res) => {
  try {
    const { productId, storeId } = req.body;

    // Validate product exists
    const productExists = await Product.findById(productId);
    if (!productExists) {
      return res.status(400).json({ error: "Invalid product selected." });
    }

    // Validate store exists
    const storeExists = await Store.findById(storeId);
    if (!storeExists) {
      return res.status(400).json({ error: "Invalid store selected." });
    }

    const data = await Promotion.create(req.body);
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📥 Get All Promotions
exports.getPromotions = async (req, res) => {
  try {
    const data = await Promotion.find()
      .populate("productId")
      .populate("storeId")
      .sort({ date: -1 });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✏️ Update Promotion
exports.updatePromotion = async (req, res) => {
  try {
    const data = await Promotion.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!data) {
      return res.status(404).json({ message: "Promotion not found" });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ❌ Delete Promotion
exports.deletePromotion = async (req, res) => {
  try {
    const data = await Promotion.findByIdAndDelete(req.params.id);

    if (!data) {
      return res.status(404).json({ message: "Promotion not found" });
    }

    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};