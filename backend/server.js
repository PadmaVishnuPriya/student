const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config({ path: __dirname + '/.env' });

const userRoutes = require("./routes/userRoutes");
const metricsRoutes = require("./routes/metricsRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/metrics", metricsRoutes);

// ✅ Root Route (FIX for ngrok issue)
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// ✅ Test Route
app.get("/ping", (req, res) => {
  res.send("pong");
});

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/trustscoreDB";

console.log("Attempting to connect to MongoDB at:", MONGO_URI);

mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch(err => console.error("MongoDB Connection Error ❌:", err));

// Server Start
const PORT = process.env.PORT || 5001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Local: http://localhost:${PORT}`);
  console.log(`Test: http://localhost:${PORT}/ping`);
});