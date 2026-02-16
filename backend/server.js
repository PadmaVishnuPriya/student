const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config({ path: __dirname + '/.env' });

const userRoutes = require("./routes/userRoutes");
const metricsRoutes = require("./routes/metricsRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/metrics", metricsRoutes);

// MongoDB Connection
// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/trustscoreDB";
console.log("Attempting to connect to MongoDB at:", MONGO_URI);

mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch(err => console.error("MongoDB Connection Error ❌:", err));

// Test Route
app.get("/ping", (req, res) => res.send("pong"));

const PORT = process.env.PORT || 5001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Test URL: http://localhost:${PORT}/ping`);
});
