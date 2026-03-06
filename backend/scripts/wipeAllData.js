/**
 * CLEAN SLATE SCRIPT
 * DANGER: This script deletes ALL users with 'student' role and ALL metrics data.
 * Run with: node backend/scripts/wipeAllData.js
 */

const mongoose = require("mongoose");
require("dotenv").config({ path: __dirname + "/../.env" });
const User = require("../models/User");
const Metrics = require("../models/Metrics");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/trustscoreDB";

async function wipe() {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB ✅");

    // 1. Delete all students
    const userResult = await User.deleteMany({ role: "student" });
    console.log(`Deleted ${userResult.deletedCount} student(s) from Users collection.`);

    // 2. Delete all metrics
    const metricsResult = await Metrics.deleteMany({});
    console.log(`Deleted ${metricsResult.deletedCount} records from Metrics collection.`);

    console.log("\n✅ Database has been RESET. You can now start fresh with Class & Section isolation.");
    console.log("Existing faculty/admin accounts were NOT deleted.");

    await mongoose.disconnect();
    process.exit(0);
}

wipe().catch(err => {
    console.error("Wipe Error:", err);
    process.exit(1);
});
