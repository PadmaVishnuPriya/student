/**
 * CLEAN SLATE 2.0
 * Deletes ALL students and ALL metrics.
 */
const mongoose = require("mongoose");
const MONGO_URI = "mongodb://127.0.0.1:27017/trustscoreDB";

async function forceWipe() {
    try {
        await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
        console.log("Connected to MongoDB ✅");

        const userCount = await mongoose.connection.collection('users').deleteMany({ role: "student" });
        console.log(`Deleted ${userCount.deletedCount} student(s).`);

        const metricsCount = await mongoose.connection.collection('metrics').deleteMany({});
        console.log(`Deleted ${metricsCount.deletedCount} metric(s).`);

        console.log("\nDATABASE RESET COMPLETE. PLEASE RESTART THE APP USING start_app.bat.");
        await mongoose.disconnect();
    } catch (err) {
        console.error("Wipe failed:", err.message);
    }
}

forceWipe();
