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
      assignments // { submittedOnTime, totalAssignments }
    } = req.body;

    // 1. Calculate Attendance (A)
    const A = (attendance.daysAttended / attendance.totalDays) * 100;

    // 2. Calculate Exam Average (E)
    const sumExams = exams.reduce((acc, curr) => acc + curr, 0);
    const E = exams.length > 0 ? (sumExams / exams.length) : 0;

    // 3. Calculate Assignment Score (AS)
    const AS = (assignments.submittedOnTime / assignments.totalAssignments) * 100;

    // 4. Calculate Improvement Score (I)
    // Fetch previous metrics for this student to get previous exam average
    const previousMetrics = await Metrics.find({ studentId }).sort({ createdAt: -1 }).limit(1);
    const previousAvg = previousMetrics.length > 0 ? previousMetrics[0].examAverage : 0;
    const improvementPercentage = previousAvg > 0 ? ((E - previousAvg) / previousAvg) * 100 : 0;
    let I;
    if (improvementPercentage > 10) {
      I = 10.67;
    } else if (improvementPercentage > 0) {
      I = 5;
    } else {
      I = 0;
    }

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
        currentAvg: safeFixed(E),
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

// 🔹 Get All Metrics (optionally filtered by class & section)
exports.getAllMetrics = async (req, res) => {
  try {
    const { class: studentClass, section } = req.query;
    let metrics = await Metrics.find().populate('studentId');

    // Filter by class and/or section if query params are provided
    if (studentClass || section) {
      metrics = metrics.filter(m => {
        const u = m.studentId;
        if (!u) return false;
        if (studentClass && u.studentClass !== Number(studentClass)) return false;
        if (section && u.section !== section) return false;
        return true;
      });
    }

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
