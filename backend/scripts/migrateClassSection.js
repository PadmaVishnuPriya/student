/**
 * One-time migration script
 * Sets studentClass = 6, section = 'A' for all existing students that have no class/section assigned.
 * Run ONCE with: node backend/scripts/migrateClassSection.js
 * After running, faculty can re-assign students via the dashboard.
 */

const mongoose = require("mongoose");
require("dotenv").config({ path: __dirname + "/../.env" });
const User = require("../models/User");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/trustscoreDB";

async function migrate() {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB ✅");

    const result = await User.updateMany(
        { role: "student", studentClass: null },
        { $set: { studentClass: 6, section: "A" } }
    );

    console.log(`Migration complete. Updated ${result.modifiedCount} student(s) → Class 6, Section A.`);
    console.log("You can now re-assign students to the correct class/section from the Faculty Dashboard.");

    await mongoose.disconnect();
    process.exit(0);
}

migrate().catch(err => {
    console.error("Migration Error:", err);
    process.exit(1);
});
