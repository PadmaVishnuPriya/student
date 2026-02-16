const mongoose = require("mongoose");

const metricsSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  // 1. Attendance (A)
  attendance: {
    daysAttended: { type: Number, required: true },
    totalDays: { type: Number, required: true },
    percentage: { type: Number } // Store calculated %
  },
  // 2. Exam Average (E)
  exams: [
    { type: Number, required: true } // Array of marks
  ],
  examAverage: { type: Number }, // Store calculated avg

  // 3. Assignment Score (AS)
  assignments: {
    submittedOnTime: { type: Number, required: true },
    totalAssignments: { type: Number, required: true },
    percentage: { type: Number } // Store calculated %
  },

  // 4. Improvement Score (I)
  improvement: {
    currentAvg: { type: Number, required: true },
    previousAvg: { type: Number, required: true },
    percentage: { type: Number }, // Raw improvement %
    score: { type: Number } // Final score (10.67 or 5 or 0)
  },

  // Final Trust Score
  trustScore: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model("Metrics", metricsSchema);
