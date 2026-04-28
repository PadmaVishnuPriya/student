const mongoose = require("mongoose");

const metricsSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  attendance: {
    daysAttended: { type: Number, required: true },
    totalDays: { type: Number, required: true },
    percentage: { type: Number }
  },
  exams: [
    { type: Number, required: true }
  ],
  examAverage: { type: Number },
  assignments: {
    submittedOnTime: { type: Number, required: true },
    totalAssignments: { type: Number, required: true },
    percentage: { type: Number }
  },
  sports: {
    participation: { type: Number, required: true },
    totalActivities: { type: Number, required: true },
    percentage: { type: Number }
  },
  extraCurricular: {
    participation: { type: Number, required: true },
    totalActivities: { type: Number, required: true },
    percentage: { type: Number }
  },
  rewards: {
    firstPrize: { type: Number, default: 0 },
    secondPrize: { type: Number, default: 0 },
    thirdPrize: { type: Number, default: 0 },
    bonusPercentage: { type: Number, default: 0 }
  },
  baseTrustScore: {
    type: Number,
    default: 0
  },
  trustScore: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model("Metrics", metricsSchema);
