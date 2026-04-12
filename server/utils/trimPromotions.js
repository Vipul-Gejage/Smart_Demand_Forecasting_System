const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = require("../config/db");
const Promotion = require("../models/Promotion");

const trimData = async () => {
  try {
    await connectDB();

    // Get first 100 documents
    const data = await Promotion.find().limit(100);

    // Delete all
    await Promotion.deleteMany();

    // Insert only 100
    await Promotion.insertMany(data);

    console.log("Trimmed to 100 documents ✅");
    process.exit();

  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

trimData();