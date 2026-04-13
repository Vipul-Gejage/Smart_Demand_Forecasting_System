const express = require("express");
const router = express.Router();

const {
  addInventory,
  getInventory,
  updateInventory,
  deleteInventory,
  getProducts,
  getStores,
} = require("../controllers/inventoryController");

// 🔐 import middleware
const authMiddleware = require("../middleware/authMiddleware");

// routes
router.post("/", authMiddleware, addInventory);
router.get("/", authMiddleware, getInventory);
router.get("/products", authMiddleware, getProducts);
router.get("/stores", authMiddleware, getStores);
router.put("/:id", authMiddleware, updateInventory);
router.delete("/:id", authMiddleware, deleteInventory);

module.exports = router;