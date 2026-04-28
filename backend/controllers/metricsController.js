const Metrics = require("../models/Metrics");

function calculateTrustScore(attendanceScore, examScore, assignmentScore, sportsScore, extraCurricularScore) {
  return (
    (0.20 * attendanceScore) +
    (0.20 * examScore) +
    (0.20 * assignmentScore) +
    (0.20 * sportsScore) +
    (0.20 * extraCurricularScore)
  ).toFixed(2);
}

const safePercentage = (completed, total) => {
  if (!total || total <= 0) return 0;
  return (completed / total) * 100;
};

const safeFixedNumber = (val) => {
  if (val === undefined || val === null || isNaN(val)) return 0;
  return Number(Number(val).toFixed(2));
};

const calculateRewardsBonus = (rewards = {}) => {
  const firstPrize = Number(rewards.firstPrize || 0);
  const secondPrize = Number(rewards.secondPrize || 0);
  const thirdPrize = Number(rewards.thirdPrize || 0);

  const rawBonus = (firstPrize * 5) + (secondPrize * 3) + (thirdPrize * 2);
  return {
    firstPrize,
    secondPrize,
    thirdPrize,
    bonusPercentage: Math.min(rawBonus, 10)
  };
};

exports.addMetrics = async (req, res) => {
  try {
    const {
      studentId,
      attendance,
      exams,
      assignments,
      sports,
      extraCurricular,
      rewards
    } = req.body;

    const attendanceScore = safePercentage(attendance.daysAttended, attendance.totalDays);
    const examTotal = exams.reduce((acc, curr) => acc + curr, 0);
    const examScore = exams.length > 0 ? examTotal / exams.length : 0;
    const assignmentScore = safePercentage(assignments.submittedOnTime, assignments.totalAssignments);
    const sportsScore = safePercentage(sports.participation, sports.totalActivities);
    const extraCurricularScore = safePercentage(extraCurricular.participation, extraCurricular.totalActivities);

    const baseTrustScore = safeFixedNumber(
      calculateTrustScore(
        attendanceScore,
        examScore,
        assignmentScore,
        sportsScore,
        extraCurricularScore
      )
    );

    const rewardData = calculateRewardsBonus(rewards);
    const finalTrustScore = Math.min(baseTrustScore + rewardData.bonusPercentage, 100);

    const newMetrics = new Metrics({
      studentId,
      attendance: {
        ...attendance,
        percentage: safeFixedNumber(attendanceScore)
      },
      exams,
      examAverage: safeFixedNumber(examScore),
      assignments: {
        ...assignments,
        percentage: safeFixedNumber(assignmentScore)
      },
      sports: {
        ...sports,
        percentage: safeFixedNumber(sportsScore)
      },
      extraCurricular: {
        ...extraCurricular,
        percentage: safeFixedNumber(extraCurricularScore)
      },
      rewards: rewardData,
      baseTrustScore,
      trustScore: safeFixedNumber(finalTrustScore)
    });

    await newMetrics.save();

    res.status(201).json({
      message: "Metrics saved successfully",
      trustScore: newMetrics.trustScore,
      baseTrustScore: newMetrics.baseTrustScore,
      rewardBonus: rewardData.bonusPercentage,
      metrics: newMetrics
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllMetrics = async (req, res) => {
  try {
    const { class: studentClass, section } = req.query;
    let metrics = await Metrics.find().populate("studentId");

    if (studentClass || section) {
      metrics = metrics.filter((m) => {
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

exports.getMetrics = async (req, res) => {
  try {
    const metrics = await Metrics.find({ studentId: req.params.studentId });
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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
