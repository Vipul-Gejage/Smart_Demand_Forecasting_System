const csv = require("csvtojson");
const path = require("path");
require("dotenv").config();

const connectDB = require("../config/db");

// Models
const Sales = require("../models/Sales");
const Product = require("../models/Product");
const Store = require("../models/Store");
const Promotion = require("../models/Promotion");
const Weather = require("../models/Weather");
const Event = require("../models/Event");
const Realtime = require("../models/Realtime");
const TestInput = require("../models/TestInput");

const importData = async () => {
  try {
    await connectDB();

    const basePath = path.join(__dirname, "../../data");

    // ================= SALES =================
    const sales = await csv().fromFile(`${basePath}/sales_history.csv`);

    const cleanedSales = sales.map(item => ({
      date: item.date,
      store_id: Number(item.store_id),
      product_id: Number(item.product_id),
      units_sold: Number(item.units_sold),
      sell_price: Number(item.sell_price),
      inventory_on_hand: Number(item.inventory_on_hand),
      stockout_flag: item.stockout_flag === "True"
    }));

    await Sales.deleteMany();
    await Sales.insertMany(cleanedSales);
    console.log("Sales Imported ✅");


    // ================= PRODUCTS =================
    const products = await csv().fromFile(`${basePath}/products.csv`);

    const cleanedProducts = products.map(item => ({
      product_id: Number(item.product_id),
      product_name: item.product_name,
      category: item.category,
      subcategory: item.subcategory,
      brand: item.brand,
      mrp: Number(item.mrp),
      shelf_life_days: Number(item.shelf_life_days),
      lead_time_days: Number(item.lead_time_days)
    }));

    await Product.deleteMany();
    await Product.insertMany(cleanedProducts);
    console.log("Products Imported ✅");


    // ================= STORES =================
    const stores = await csv().fromFile(`${basePath}/stores.csv`);

    const cleanedStores = stores.map(item => ({
      store_id: Number(item.store_id),
      store_name: item.store_name,
      city: item.city,
      state: item.state,
      store_type: item.store_type,
      store_size_sqft: Number(item.store_size_sqft)
    }));

    await Store.deleteMany();
    await Store.insertMany(cleanedStores);
    console.log("Stores Imported ✅");


    // ================= PROMOTIONS =================
    const promotions = await csv().fromFile(`${basePath}/promotions.csv`);

    const cleanedPromotions = promotions.map(item => ({
      date: item.date,
      store_id: Number(item.store_id),
      product_id: Number(item.product_id),
      promo_type: item.promo_type,
      discount_pct: Number(item.discount_pct),
      display_flag: item.display_flag === "True",
      campaign_name: item.campaign_name
    }));

    await Promotion.deleteMany();
    await Promotion.insertMany(cleanedPromotions);
    console.log("Promotions Imported ✅");


    // ================= EVENTS =================
    const events = await csv().fromFile(`${basePath}/events_calendar.csv`);

    const cleanedEvents = events.map(item => ({
      date: item.date,
      event_name: item.event_name,
      event_type: item.event_type,
      city: item.city,
      impact_level: item.impact_level
    }));

    await Event.deleteMany();
    await Event.insertMany(cleanedEvents);
    console.log("Events Imported ✅");


    // ================= WEATHER =================
    const weather = await csv().fromFile(`${basePath}/weather.csv`);

    const cleanedWeather = weather.map(item => ({
      date: item.date,
      city: item.city,
      avg_temp: Number(item.avg_temp),
      rainfall_mm: Number(item.rainfall_mm),
      humidity: Number(item.humidity),
      weather_condition: item.weather_condition
    }));

    await Weather.deleteMany();
    await Weather.insertMany(cleanedWeather);
    console.log("Weather Imported ✅");


    // ================= REALTIME =================
    const realtime = await csv().fromFile(`${basePath}/realtime_signals.csv`);

    const cleanedRealtime = realtime.map(item => ({
      timestamp: item.timestamp,
      store_id: Number(item.store_id),
      product_id: Number(item.product_id),
      signal_type: item.signal_type,
      signal_strength: Number(item.signal_strength),
      notes: item.notes
    }));

    await Realtime.deleteMany();
    await Realtime.insertMany(cleanedRealtime);
    console.log("Realtime Imported ✅");


    // ================= TEST INPUT =================
    const testInput = await csv().fromFile(`${basePath}/test_input.csv`);

    const cleanedTestInput = testInput.map(item => ({
      date: item.date,
      store_id: Number(item.store_id),
      product_id: Number(item.product_id)
    }));

    await TestInput.deleteMany();
    await TestInput.insertMany(cleanedTestInput);
    console.log("Test Input Imported ✅");


    console.log("\n🎉 ALL DATA IMPORTED SUCCESSFULLY 🚀");
    process.exit();

  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

importData();