import React, { useEffect, useState } from "react";
import axios from "axios";

const baseCardStyle = {
  padding: "40px 28px",
  borderRadius: "16px",
  color: "white",
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.15)",
  minHeight: "220px",
};

const formatPercent = (value) => `${Number(value || 0).toFixed(2)}%`;

const DashboardOverview = ({ selectedClass, selectedSection }) => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    avgTrustScore: 0,
    avgAttendance: 0,
    avgExamScore: 0,
    avgAssignmentScore: 0,
    topPerformer: null,
    needsAttention: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedClass && selectedSection) {
      fetchStats();
    }
  }, [selectedClass, selectedSection]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const [studentsRes, metricsRes] = await Promise.all([
        axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/users/students?class=${selectedClass}&section=${selectedSection}`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/metrics?class=${selectedClass}&section=${selectedSection}`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
      ]);

      const students = studentsRes.data || [];
      const metrics = metricsRes.data || [];

      const latestMetricsByStudent = new Map();
      metrics.forEach((metric) => {
        const studentKey = metric.studentId?._id || metric.studentId || metric.studentName;
        if (!studentKey) return;

        const previousMetric = latestMetricsByStudent.get(studentKey);
        const currentCreatedAt = new Date(metric.createdAt || 0).getTime();
        const previousCreatedAt = previousMetric
          ? new Date(previousMetric.createdAt || 0).getTime()
          : 0;

        if (!previousMetric || currentCreatedAt >= previousCreatedAt) {
          latestMetricsByStudent.set(studentKey, metric);
        }
      });

      const latestMetrics = Array.from(latestMetricsByStudent.values());
      const metricCount = latestMetrics.length;

      const totals = latestMetrics.reduce(
        (acc, metric) => {
          acc.trust += Number(metric.trustScore || 0);
          acc.attendance += Number(metric.attendance?.percentage || 0);
          acc.exam += Number(metric.examAverage || 0);
          acc.assignment += Number(metric.assignments?.percentage || 0);
          return acc;
        },
        { trust: 0, attendance: 0, exam: 0, assignment: 0 }
      );

      const topMetric = [...latestMetrics].sort(
        (a, b) => Number(b.trustScore || 0) - Number(a.trustScore || 0)
      )[0];

      const needsAttention = [...latestMetrics]
        .sort((a, b) => {
          const scoreDifference = Number(a.trustScore || 0) - Number(b.trustScore || 0);
          if (scoreDifference !== 0) return scoreDifference;
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        })
        .slice(0, 3)
        .map((metric) => ({
          name: metric.studentId?.name || metric.studentName || "Unknown",
          score: Number(metric.trustScore || 0).toFixed(2),
        }));

      setStats({
        totalStudents: students.length,
        avgTrustScore: metricCount ? totals.trust / metricCount : 0,
        avgAttendance: metricCount ? totals.attendance / metricCount : 0,
        avgExamScore: metricCount ? totals.exam / metricCount : 0,
        avgAssignmentScore: metricCount ? totals.assignment / metricCount : 0,
        topPerformer: topMetric?.studentId?.name || topMetric?.studentName || null,
        needsAttention,
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedClass || !selectedSection) {
    return (
      <div
        style={{
          background: "white",
          padding: "60px 48px",
          borderRadius: "20px",
          textAlign: "center",
          color: "#9ca3af",
          fontSize: "24px",
        }}
      >
        Please select a class and section to view overview
      </div>
    );
  }

  if (loading) {
    return (
      <div
        style={{
          background: "white",
          padding: "48px",
          borderRadius: "20px",
          textAlign: "center",
          color: "#6b7280",
          fontSize: "20px",
        }}
      >
        Loading class overview...
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "24px" }}>
      <div style={{ ...baseCardStyle, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
        <div style={{ fontSize: "42px", marginBottom: "14px" }}>Students</div>
        <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "10px" }}>Total Students</div>
        <div style={{ fontSize: "44px", fontWeight: "700" }}>{stats.totalStudents}</div>
      </div>

      <div style={{ ...baseCardStyle, background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" }}>
        <div style={{ fontSize: "42px", marginBottom: "14px" }}>Trust</div>
        <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "10px" }}>Class Avg Trust Score</div>
        <div style={{ fontSize: "44px", fontWeight: "700" }}>{formatPercent(stats.avgTrustScore)}</div>
      </div>

      <div style={{ ...baseCardStyle, background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" }}>
        <div style={{ fontSize: "42px", marginBottom: "14px" }}>Attendance</div>
        <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "10px" }}>Class Avg Attendance</div>
        <div style={{ fontSize: "44px", fontWeight: "700" }}>{formatPercent(stats.avgAttendance)}</div>
      </div>

      <div style={{ ...baseCardStyle, background: "linear-gradient(135deg, #36d1dc 0%, #5b86e5 100%)" }}>
        <div style={{ fontSize: "42px", marginBottom: "14px" }}>Exams</div>
        <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "10px" }}>Class Avg Exam Score</div>
        <div style={{ fontSize: "44px", fontWeight: "700" }}>{formatPercent(stats.avgExamScore)}</div>
      </div>

      <div style={{ ...baseCardStyle, background: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)" }}>
        <div style={{ fontSize: "42px", marginBottom: "14px" }}>Assignments</div>
        <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "10px" }}>Class Avg Assignment Score</div>
        <div style={{ fontSize: "44px", fontWeight: "700" }}>{formatPercent(stats.avgAssignmentScore)}</div>
      </div>

      <div style={{ ...baseCardStyle, background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)" }}>
        <div style={{ fontSize: "42px", marginBottom: "14px" }}>Top</div>
        <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "10px" }}>Top Performer</div>
        <div style={{ fontSize: "24px", fontWeight: "700", lineHeight: 1.3 }}>
          {stats.topPerformer || "No data yet"}
        </div>
      </div>

      <div style={{ ...baseCardStyle, background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)" }}>
        <div style={{ fontSize: "42px", marginBottom: "14px" }}>Alert</div>
        <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "16px" }}>Needs Attention</div>
        {stats.needsAttention.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {stats.needsAttention.map((student, idx) => (
              <div
                key={`${student.name}-${idx}`}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  borderRadius: "10px",
                  padding: "10px 12px",
                }}
              >
                <div style={{ fontSize: "15px", fontWeight: "700" }}>{student.name}</div>
                <div style={{ fontSize: "13px", opacity: 0.95 }}>Trust Score: {student.score}%</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: "18px", fontWeight: "700" }}>No low scores yet</div>
        )}
      </div>
    </div>
  );
};

export default DashboardOverview;
