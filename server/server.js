require("dotenv").config();   // ✅ MUST BE FIRST

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
connectDB();

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// routes
app.use("/api/inventory", require("./routes/inventoryRoutes"));
app.use("/api/promotions", require("./routes/promotionRoutes"));
app.use("/api/forecast", require("./routes/forecastRoutes"));
app.use("/api/sales", require("./routes/salesRoutes"));
app.use("/api/alerts", require("./routes/alertRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});