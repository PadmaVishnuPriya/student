const Metrics = require("../models/Metrics");

// 🔹 Trust Score Function
function calculateTrustScore(A, E, AS, I) {
  // Formula: Trust = 0.35 * A + 0.30 * E + 0.25 * AS + 0.10 * I
  return (
    (0.35 * A) +
    (0.30 * E) +
    (0.25 * AS) +
    (0.10 * I)
  ).toFixed(2);
}

// 🔹 Add Metrics
exports.addMetrics = async (req, res) => {
  try {
    const {
      studentId,
      attendance, // { daysAttended, totalDays }
      exams,      // [80, 90, 70]
      assignments,// { submittedOnTime, totalAssignments }
      improvement // { currentAvg, previousAvg }
    } = req.body;

    // 1. Calculate Attendance (A)
    const A = (attendance.daysAttended / attendance.totalDays) * 100;

    // 2. Calculate Exam Average (E)
    const sumExams = exams.reduce((acc, curr) => acc + curr, 0);
    const E = exams.length > 0 ? (sumExams / exams.length) : 0;

    // 3. Calculate Assignment Score (AS)
    const AS = (assignments.submittedOnTime / assignments.totalAssignments) * 100;

    // 4. Calculate Improvement Score (I)
    // Auto-calculate Current Average from this exam set
    const currentAvg = Number(E) || 0;

    // Fetch previous metrics for this student to get Previous Average
    const previousMetrics = await Metrics.findOne({ studentId }).sort({ createdAt: -1 });

    // DEBUG LOGS
    console.log("DEBUG: previousMetrics found:", !!previousMetrics);
    if (previousMetrics) console.log("DEBUG: previousMetrics examAverage:", previousMetrics.examAverage);

    // Safe lookup: if previousMetrics exists but examAverage is undefined (old schema), default to 0
    let previousAvg = 0;
    if (previousMetrics && previousMetrics.examAverage !== undefined && previousMetrics.examAverage !== null) {
      previousAvg = Number(previousMetrics.examAverage);
    }

    console.log("DEBUG: Calculated previousAvg:", previousAvg);

    // Improvement % = (Current - Previous) / Previous * 100
    // Rule:
    // If > 0 -> Use Improvement %
    // If = 0 -> 5
    // If < 0 -> 0 (or if previous is 0, maybe handle specifically)
    let I = 0;
    let improvementPercentage = 0;

    if (previousAvg === 0) {
      // If no previous record, we can't calculate improvement % accurately.
      I = 5;
      improvementPercentage = 0;
    } else {
      improvementPercentage = ((currentAvg - previousAvg) / previousAvg) * 100;

      if (improvementPercentage > 0) {
        I = improvementPercentage;
      } else if (improvementPercentage === 0) {
        I = 5;
      } else {
        I = 0;
      }
    }

    console.log("DEBUG: I:", I, "improvementPercentage:", improvementPercentage);

    const trustScore = calculateTrustScore(A, E, AS, I);

    // Helper to safely format number
    const safeFixed = (val) => {
      if (val === undefined || val === null || isNaN(val)) return "0.00";
      return Number(val).toFixed(2);
    };

    const newMetrics = new Metrics({
      studentId,
      attendance: {
        ...attendance,
        percentage: safeFixed(A)
      },
      exams,
      examAverage: safeFixed(E),
      assignments: {
        ...assignments,
        percentage: safeFixed(AS)
      },
      improvement: {
        currentAvg: safeFixed(currentAvg),
        previousAvg: safeFixed(previousAvg),
        percentage: safeFixed(improvementPercentage),
        score: safeFixed(I)
      },
      trustScore
    });

    await newMetrics.save();

    res.status(201).json({
      message: "Metrics saved successfully ✅",
      trustScore,
      metrics: newMetrics
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Get All Metrics
exports.getAllMetrics = async (req, res) => {
  try {
    const metrics = await Metrics.find().populate('studentId');
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Get Metrics by Student
exports.getMetrics = async (req, res) => {
  try {
    const metrics = await Metrics.find({ studentId: req.params.studentId });
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// 🔹 Delete Metric
exports.deleteMetric = async (req, res) => {
  try {
    const { id } = req.params;
    const metric = await Metrics.findById(id);

    if (!metric) {
      return res.status(404).json({ message: "Metric record not found" });
    }

    await Metrics.findByIdAndDelete(id);
    res.json({ message: "Metric deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
