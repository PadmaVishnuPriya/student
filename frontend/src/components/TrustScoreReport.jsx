import React, { useState, useEffect } from "react";
import axios from "axios";

const TrustScoreReport = ({ selectedClass, selectedSection }) => {
  const [metricsList, setMetricsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (selectedClass && selectedSection) {
      fetchMetrics();
    }
  }, [selectedClass, selectedSection]);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/metrics?class=${selectedClass}&section=${selectedSection}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMetricsList(response.data || []);
    } catch (err) {
      console.error("Error fetching metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMetric = async (metricId) => {
    if (!window.confirm("Delete this metric entry?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/metrics/${metricId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccessMsg("✅ Metric deleted");
      fetchMetrics();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error("Error deleting metric:", err);
    }
  };

  if (!selectedClass || !selectedSection) {
    return (
      <div style={{
        background: "white",
        padding: "60px 48px",
        borderRadius: "20px",
        textAlign: "center",
        color: "#9ca3af",
        fontSize: "24px"
      }}>
        📚 Please select a class and section first
      </div>
    );
  }

  return (
    <div style={{
      background: "white",
      padding: "48px",
      borderRadius: "20px",
      boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
      border: "2px solid #e5e7eb"
    }}>
      <h2 style={{ margin: "0 0 32px 0", fontSize: "36px", fontWeight: "700", color: "#1f2937" }}>
        ⭐ Trust Score Report
      </h2>

      {successMsg && (
        <div style={{
          background: "#dcfce7",
          border: "1px solid #bbf7d0",
          color: "#166534",
          padding: "16px 20px",
          borderRadius: "12px",
          marginBottom: "20px",
          fontSize: "16px",
          fontWeight: "500"
        }}>
          {successMsg}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#9ca3af", fontSize: "18px" }}>
          Loading metrics...
        </div>
      ) : metricsList.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "60px 20px",
          color: "#9ca3af",
          fontSize: "20px"
        }}>
          📭 No metrics data available yet
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "16px"
          }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "2px solid #e5e7eb" }}>
                <th style={{ padding: "16px", textAlign: "left", fontWeight: "700", color: "#374151" }}>Student</th>
                <th style={{ padding: "16px", textAlign: "center", fontWeight: "700", color: "#374151" }}>Exam Marks</th>
                <th style={{ padding: "16px", textAlign: "center", fontWeight: "700", color: "#374151" }}>Exam Avg</th>
                <th style={{ padding: "16px", textAlign: "center", fontWeight: "700", color: "#374151" }}>Attendance</th>
                <th style={{ padding: "16px", textAlign: "center", fontWeight: "700", color: "#374151" }}>Assignments</th>
                <th style={{ padding: "16px", textAlign: "center", fontWeight: "700", color: "#374151" }}>Improvement</th>
                <th style={{ padding: "16px", textAlign: "center", fontWeight: "700", color: "#374151" }}>Trust Score</th>
                <th style={{ padding: "16px", textAlign: "center", fontWeight: "700", color: "#374151" }}>Date</th>
                <th style={{ padding: "16px", textAlign: "center", fontWeight: "700", color: "#374151" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {metricsList.map((m) => (
                <tr key={m._id} style={{ borderBottom: "1px solid #e5e7eb", transition: "all 0.2s" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#f9fafb"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "white"}
                >
                  <td style={{ padding: "16px", fontWeight: "600", color: "#1f2937" }}>
                    {m.studentId?.name || m.studentName || "Unknown"}
                  </td>
                  <td style={{ padding: "16px", textAlign: "center", color: "#374151", fontSize: "14px" }}>
                    {Array.isArray(m.exams) ? m.exams.join(", ") : "-"}
                  </td>
                  <td style={{ padding: "16px", textAlign: "center", color: "#1f2937", fontWeight: "600" }}>
                    {m.examAverage || "-"}
                  </td>
                  <td style={{ padding: "16px", textAlign: "center", color: "#1f2937", fontWeight: "600" }}>
                    {m.attendance ? `${m.attendance.daysAttended}/${m.attendance.totalDays} (${m.attendance.percentage}%)` : "-"}
                  </td>
                  <td style={{ padding: "16px", textAlign: "center", color: "#1f2937", fontWeight: "600" }}>
                    {m.assignments ? `${m.assignments.submittedOnTime}/${m.assignments.totalAssignments} (${m.assignments.percentage}%)` : "-"}
                  </td>
                  <td style={{ padding: "16px", textAlign: "center", color: "#1f2937", fontWeight: "600" }}>
                    {m.improvement?.score || "-"}
                  </td>
                  <td style={{ padding: "16px", textAlign: "center" }}>
                    <div style={{
                      background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                      color: "white",
                      padding: "8px 14px",
                      borderRadius: "8px",
                      fontWeight: "700",
                      display: "inline-block",
                      minWidth: "60px"
                    }}>
                      {m.trustScore || "-"}
                    </div>
                  </td>
                  <td style={{ padding: "16px", textAlign: "center", color: "#6b7280", fontSize: "14px" }}>
                    {new Date(m.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "16px", textAlign: "center" }}>
                    <button
                      onClick={() => handleDeleteMetric(m._id)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "18px",
                        padding: "8px 12px",
                        borderRadius: "6px",
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={(e) => e.target.style.background = "#fee2e2"}
                      onMouseLeave={(e) => e.target.style.background = "none"}
                      title="Delete metric"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TrustScoreReport;
