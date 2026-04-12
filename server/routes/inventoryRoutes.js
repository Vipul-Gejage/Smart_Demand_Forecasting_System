const express = require("express");
const router = express.Router();
const {
  getInventory,
  addInventory,
  deleteInventory,
} = require("../controllers/inventoryController");

router.get("/", getInventory);
router.post("/", addInventory);
router.delete("/:id", deleteInventory);

module.exports = router;