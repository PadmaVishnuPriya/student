/**
 * DIAGNOSTICS SCRIPT
 * Lists all students and their class/section info.
 */
const mongoose = require("mongoose");
require("dotenv").config({ path: __dirname + "/../.env" });
const User = require("../models/User");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/trustscoreDB";

async function diagnose() {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB ✅");

    const students = await User.find({ role: "student" });
    console.log(`\nFound ${students.length} student(s) in database:\n`);

    students.forEach(s => {
        console.log(`- Name: ${s.name}`);
        console.log(`  Email: ${s.email}`);
        console.log(`  Class: ${s.studentClass} (${typeof s.studentClass})`);
        console.log(`  Section: ${s.section} (${typeof s.section})`);
        console.log(`  _id: ${s._id}`);
        console.log("-----------------------------------");
    });

    await mongoose.disconnect();
}

diagnose().catch(err => {
    console.error("Diagnosis Error:", err);
    process.exit(1);
});
