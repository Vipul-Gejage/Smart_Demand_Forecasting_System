const express = require("express");
const router = express.Router();

const {
  addInventory,
  getInventory,
  updateInventory,
  deleteInventory,
} = require("../controllers/inventoryController");

// 🔐 import middleware
const authMiddleware = require("../middleware/authMiddleware");

// routes (protected)
router.post("/", authMiddleware, addInventory);
router.get("/", authMiddleware, getInventory);
router.put("/:id", authMiddleware, updateInventory);
router.delete("/:id", authMiddleware, deleteInventory);

module.exports = router;