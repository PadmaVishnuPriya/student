import React, { useState, useEffect } from "react";
import axios from "axios";

const ManageStudents = ({ selectedClass, selectedSection, onStudentsUpdate }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentMetrics, setStudentMetrics] = useState(null);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  useEffect(() => {
    if (selectedClass && selectedSection) {
      fetchStudents();
    }
  }, [selectedClass, selectedSection]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/users/students?class=${selectedClass}&section=${selectedSection}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const sorted = (response.data || []).sort((a, b) => a.name.localeCompare(b.name));
      setStudents(sorted);
    } catch (err) {
      console.error("Error fetching students:", err);
      setError("Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentMetrics = async (studentId) => {
    setLoadingMetrics(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/metrics?studentId=${studentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStudentMetrics(response.data || []);
    } catch (err) {
      console.error("Error fetching metrics:", err);
      setStudentMetrics([]);
    } finally {
      setLoadingMetrics(false);
    }
  };

  const handleStudentClick = (student) => {
    setSelectedStudent(student);
    fetchStudentMetrics(student._id);
  };

  const closeStudentDetails = () => {
    setSelectedStudent(null);
    setStudentMetrics(null);
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/users/register`,
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          userType: "student",
          studentClass: selectedClass,
          section: selectedSection
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccessMsg("✅ Student added successfully!");
      setFormData({ name: "", email: "", password: "", confirmPassword: "" });
      setShowForm(false);
      fetchStudents();
      if (onStudentsUpdate) onStudentsUpdate();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(`Failed to add student: ${msg}`);
    }
  };

  if (!selectedClass || !selectedSection) {
    return (
      <div style={{
        background: "white",
        padding: "80px 60px",
        borderRadius: "20px",
        textAlign: "center",
        color: "#9ca3af",
        fontSize: "32px",
        fontWeight: "600"
      }}>
        📚 Please select a class and section first
      </div>
    );
  }

  // If a student is selected, show their details
  if (selectedStudent) {
    return (
      <div style={{
        background: "white",
        borderRadius: "20px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
        border: "3px solid #e5e7eb",
        padding: "60px"
      }}>
        <button
          onClick={closeStudentDetails}
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            border: "none",
            padding: "16px 32px",
            borderRadius: "12px",
            fontSize: "18px",
            fontWeight: "700",
            cursor: "pointer",
            marginBottom: "40px",
            transition: "all 0.3s"
          }}
          onMouseEnter={(e) => e.target.style.transform = "translateY(-2px)"}
          onMouseLeave={(e) => e.target.style.transform = "translateY(0)"}
        >
          ← Back to Students List
        </button>

        {/* Student Header */}
        <div style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          padding: "60px",
          borderRadius: "16px",
          marginBottom: "40px",
          boxShadow: "0 8px 24px rgba(102, 126, 234, 0.3)"
        }}>
          <div style={{ fontSize: "28px", opacity: 0.9, marginBottom: "16px" }}>Student Profile</div>
          <div style={{ fontSize: "56px", fontWeight: "700", marginBottom: "24px" }}>
            {selectedStudent.name}
          </div>
          <div style={{ fontSize: "24px", opacity: 0.95 }}>
            Email: {selectedStudent.email}
          </div>
        </div>

        {/* Metrics Section */}
        <div style={{ marginTop: "40px" }}>
          <h2 style={{ fontSize: "40px", fontWeight: "700", color: "#1f2937", marginBottom: "32px" }}>
            📊 Performance Metrics
          </h2>

          {loadingMetrics ? (
            <div style={{
              textAlign: "center",
              padding: "60px 40px",
              fontSize: "24px",
              color: "#9ca3af"
            }}>
              Loading metrics...
            </div>
          ) : studentMetrics && studentMetrics.length > 0 ? (
            <div style={{ overflowX: "auto" }}>
              <table style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "18px"
              }}>
                <thead>
                  <tr style={{ background: "#f9fafb", borderBottom: "3px solid #e5e7eb" }}>
                    <th style={{ padding: "24px", textAlign: "left", fontWeight: "700", color: "#1f2937", fontSize: "20px" }}>Exam Marks</th>
                    <th style={{ padding: "24px", textAlign: "center", fontWeight: "700", color: "#1f2937", fontSize: "20px" }}>Exam Avg</th>
                    <th style={{ padding: "24px", textAlign: "center", fontWeight: "700", color: "#1f2937", fontSize: "20px" }}>Attendance</th>
                    <th style={{ padding: "24px", textAlign: "center", fontWeight: "700", color: "#1f2937", fontSize: "20px" }}>Assignments</th>
                    <th style={{ padding: "24px", textAlign: "center", fontWeight: "700", color: "#1f2937", fontSize: "20px" }}>Trust Score</th>
                    <th style={{ padding: "24px", textAlign: "center", fontWeight: "700", color: "#1f2937", fontSize: "20px" }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {studentMetrics.map((m, idx) => (
                    <tr key={m._id || idx} style={{ borderBottom: "2px solid #e5e7eb", transition: "all 0.2s" }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "#f9fafb"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "white"}
                    >
                      <td style={{ padding: "28px 24px", color: "#374151", fontSize: "18px" }}>
                        {Array.isArray(m.exams) ? m.exams.join(", ") : "-"}
                      </td>
                      <td style={{ padding: "28px 24px", textAlign: "center", color: "#1f2937", fontSize: "20px", fontWeight: "600" }}>
                        {m.examAverage || "-"}
                      </td>
                      <td style={{ padding: "28px 24px", textAlign: "center", color: "#1f2937", fontSize: "20px", fontWeight: "600" }}>
                        {m.attendance ? `${m.attendance.daysAttended}/${m.attendance.totalDays} (${m.attendance.percentage}%)` : "-"}
                      </td>
                      <td style={{ padding: "28px 24px", textAlign: "center", color: "#1f2937", fontSize: "20px", fontWeight: "600" }}>
                        {m.assignments ? `${m.assignments.submittedOnTime}/${m.assignments.totalAssignments} (${m.assignments.percentage}%)` : "-"}
                      </td>
                      <td style={{ padding: "28px 24px", textAlign: "center" }}>
                        <div style={{
                          background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                          color: "white",
                          padding: "12px 20px",
                          borderRadius: "10px",
                          fontWeight: "700",
                          display: "inline-block",
                          minWidth: "80px",
                          fontSize: "20px"
                        }}>
                          {m.trustScore || "-"}
                        </div>
                      </td>
                      <td style={{ padding: "28px 24px", textAlign: "center", color: "#6b7280", fontSize: "18px" }}>
                        {new Date(m.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{
              background: "#f0fdf4",
              border: "3px solid #bbf7d0",
              padding: "60px 40px",
              borderRadius: "16px",
              textAlign: "center",
              fontSize: "24px",
              color: "#166534",
              fontWeight: "600"
            }}>
              📭 No metrics recorded yet for this student
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "40px" }}>
      {error && (
        <div style={{
          background: "#fee2e2",
          border: "1px solid #fecaca",
          color: "#991b1b",
          padding: "16px 20px",
          borderRadius: "12px",
          fontSize: "18px",
          fontWeight: "500"
        }}>
          ⚠️ {error}
        </div>
      )}

      {successMsg && (
        <div style={{
          background: "#dcfce7",
          border: "1px solid #bbf7d0",
          color: "#166534",
          padding: "16px 20px",
          borderRadius: "12px",
          fontSize: "18px",
          fontWeight: "500"
        }}>
          {successMsg}
        </div>
      )}

      {/* Add Student Button & Form */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          style={{
            padding: "16px 32px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            border: "none",
            borderRadius: "12px",
            fontSize: "20px",
            fontWeight: "700",
            cursor: "pointer",
            transition: "all 0.3s",
            boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
            width: "fit-content"
          }}
          onMouseEnter={(e) => e.target.style.transform = "translateY(-2px)"}
          onMouseLeave={(e) => e.target.style.transform = "translateY(0)"}
        >
          ➕ Add New Student
        </button>
      ) : (
        <div style={{
          background: "white",
          padding: "48px",
          borderRadius: "16px",
          border: "2px solid #e5e7eb",
          boxShadow: "0 4px 16px rgba(0,0,0,0.08)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <h3 style={{ margin: 0, fontSize: "28px", fontWeight: "700", color: "#1f2937" }}>➕ Add New Student</h3>
            <button
              onClick={() => setShowForm(false)}
              style={{
                background: "none",
                border: "none",
                fontSize: "28px",
                cursor: "pointer",
                color: "#9ca3af"
              }}
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleAddStudent}>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "18px", fontWeight: "700", color: "#374151", marginBottom: "8px" }}>
                Full Name *
              </label>
              <input
                type="text"
                placeholder="Enter student name"
                value={formData.name}
                onChange={(e) => { setError(""); setFormData({ ...formData, name: e.target.value }); }}
                required
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: "10px",
                  border: "2px solid #e5e7eb",
                  fontSize: "16px",
                  boxSizing: "border-box",
                  fontFamily: "inherit"
                }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "18px", fontWeight: "700", color: "#374151", marginBottom: "8px" }}>
                Email Address *
              </label>
              <input
                type="email"
                placeholder="student@school.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: "10px",
                  border: "2px solid #e5e7eb",
                  fontSize: "16px",
                  boxSizing: "border-box",
                  fontFamily: "inherit"
                }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
              <div>
                <label style={{ display: "block", fontSize: "18px", fontWeight: "700", color: "#374151", marginBottom: "8px" }}>
                  Password *
                </label>
                <input
                  type="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    borderRadius: "10px",
                    border: "2px solid #e5e7eb",
                    fontSize: "16px",
                    boxSizing: "border-box",
                    fontFamily: "inherit"
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "18px", fontWeight: "700", color: "#374151", marginBottom: "8px" }}>
                  Confirm Password *
                </label>
                <input
                  type="password"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    borderRadius: "10px",
                    border: "2px solid #e5e7eb",
                    fontSize: "16px",
                    boxSizing: "border-box",
                    fontFamily: "inherit"
                  }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                type="submit"
                style={{
                  flex: 1,
                  padding: "14px 24px",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "18px",
                  fontWeight: "700",
                  cursor: "pointer",
                  transition: "all 0.3s"
                }}
              >
                ✓ Create Student
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{
                  flex: 1,
                  padding: "14px 24px",
                  background: "#f3f4f6",
                  color: "#6b7280",
                  border: "2px solid #e5e7eb",
                  borderRadius: "10px",
                  fontSize: "18px",
                  fontWeight: "700",
                  cursor: "pointer",
                  transition: "all 0.3s"
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Students List */}
      <div style={{
        background: "white",
        padding: "32px",
        borderRadius: "16px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
        border: "2px solid #e5e7eb"
      }}>
        <h3 style={{ margin: "0 0 20px 0", fontSize: "28px", fontWeight: "700", color: "#1f2937" }}>
          👥 Students in Class {selectedClass} - Section {selectedSection} ({students.length})
        </h3>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#9ca3af" }}>
            Loading students...
          </div>
        ) : students.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "40px 20px",
            color: "#9ca3af",
            fontSize: "18px"
          }}>
            📭 No students found in this class yet
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "16px",
            maxHeight: "600px",
            overflowY: "auto"
          }}>
            {students.map((s) => (
              <div key={s._id} style={{
                background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
                border: "2px solid #e5e7eb",
                padding: "20px",
                borderRadius: "12px",
                transition: "all 0.2s",
                cursor: "pointer"
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "linear-gradient(135deg, #667eea15 0%, #764ba215 100%)";
                  e.currentTarget.style.borderColor = "#667eea";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)";
                  e.currentTarget.style.borderColor = "#e5e7eb";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div style={{ fontSize: "18px", fontWeight: "700", color: "#1f2937", marginBottom: "8px" }}>
                  {s.name}
                </div>
                <div style={{ fontSize: "16px", color: "#6b7280", wordBreak: "break-all" }}>
                  {s.email}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageStudents;
