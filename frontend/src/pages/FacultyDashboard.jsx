import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import DashboardOverview from "../components/DashboardOverview";
import ManageStudents from "../components/ManageStudents";
import ManageMetrics from "../components/ManageMetrics";
import TrustScoreReport from "../components/TrustScoreReport";
import "../styles/FacultyDashboard.css";

const FacultyDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [activePage, setActivePage] = useState("overview");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch students when class/section changes
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
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const renderContent = () => {
    switch (activePage) {
      case "overview":
        return <DashboardOverview selectedClass={selectedClass} selectedSection={selectedSection} />;
      case "add":
        return <ManageStudents selectedClass={selectedClass} selectedSection={selectedSection} onStudentsUpdate={fetchStudents} />;
      case "marks":
        return <ManageMetrics selectedClass={selectedClass} selectedSection={selectedSection} students={students} />;
      case "trust":
        return <TrustScoreReport selectedClass={selectedClass} selectedSection={selectedSection} />;
      default:
        return <DashboardOverview selectedClass={selectedClass} selectedSection={selectedSection} />;
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafb", width: "100%" }}>
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        {/* Header */}
        <header style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          padding: "40px 60px",
          color: "white",
          boxShadow: "0 8px 30px rgba(102, 126, 234, 0.22)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "36px", fontWeight: "700" }}>Adharsh Vidhyalaya</h1>
            <p style={{ margin: "8px 0 0 0", opacity: 0.9, fontSize: "18px" }}>Faculty Dashboard - Manage Students & Performance</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{ textAlign: "right" }}>
              <p style={{ margin: 0, fontSize: "16px", opacity: 0.9 }}>Welcome back,</p>
              <p style={{ margin: "4px 0 0 0", fontSize: "20px", fontWeight: "700" }}>{user?.name}</p>
            </div>
            <button
              onClick={handleLogout}
              style={{
                padding: "12px 20px",
                background: "rgba(255,255,255,0.22)",
                border: "1px solid rgba(255,255,255,0.35)",
                color: "white",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "700",
                transition: "all 0.3s",
              }}
              onMouseEnter={(e) => e.target.style.background = "rgba(255,255,255,0.3)"}
              onMouseLeave={(e) => e.target.style.background = "rgba(255,255,255,0.2)"}
            >
              Logout
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main style={{ flex: 1, padding: "40px 60px", overflowY: "auto", width: "100%" }}>
          {/* Class & Section Selector */}
          <div style={{
            background: "white",
            padding: "40px",
            borderRadius: "16px",
            marginBottom: "40px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
            border: "2px solid #e5e7eb"
          }}>
            <h2 style={{ margin: "0 0 24px 0", fontSize: "24px", fontWeight: "700", color: "#1f2937" }}>
              📚 Select Class & Section
            </h2>
            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", alignItems: "flex-end" }}>
              <div>
                <label style={{ display: "block", fontSize: "16px", fontWeight: "700", color: "#374151", marginBottom: "10px" }}>
                  Class
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  style={{
                    padding: "12px 14px",
                    borderRadius: "8px",
                    border: "2px solid #e5e7eb",
                    fontSize: "16px",
                    fontWeight: "600",
                    background: "white",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    minWidth: "150px"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#667eea"}
                  onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                >
                  <option value="">Select Class</option>
                  {[6, 7, 8, 9, 10].map((c) => (
                    <option key={c} value={c}>Class {c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "16px", fontWeight: "700", color: "#374151", marginBottom: "10px" }}>
                  Section
                </label>
                <select
                  value={selectedSection}
                  disabled={!selectedClass}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  style={{
                    padding: "12px 14px",
                    borderRadius: "8px",
                    border: "2px solid #e5e7eb",
                    fontSize: "16px",
                    fontWeight: "600",
                    background: selectedClass ? "white" : "#f3f4f6",
                    cursor: selectedClass ? "pointer" : "not-allowed",
                    opacity: selectedClass ? 1 : 0.6,
                    transition: "all 0.2s",
                    minWidth: "150px"
                  }}
                >
                  <option value="">Select Section</option>
                  {["A", "B", "C"].map((s) => (
                    <option key={s} value={s}>Section {s}</option>
                  ))}
                </select>
              </div>
              {selectedClass && selectedSection && (
                <div style={{
                  background: "linear-gradient(135deg, #667eea15 0%, #764ba215 100%)",
                  border: "2px solid #667eea",
                  borderRadius: "10px",
                  padding: "14px 20px",
                  fontSize: "18px",
                  fontWeight: "700",
                  color: "#764ba2"
                }}>
                  ✓ Class {selectedClass} - Section {selectedSection}
                </div>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          {selectedClass && selectedSection && (
            <div style={{
              display: "flex",
              gap: "12px",
              marginBottom: "32px",
              flexWrap: "wrap"
            }}>
              {[
                { id: "overview", label: "📊 Dashboard Overview", icon: "📊" },
                { id: "add", label: "👥 Manage Students", icon: "👥" },
                { id: "marks", label: "📝 Add Metrics", icon: "📝" },
                { id: "trust", label: "⭐ Trust Score Report", icon: "⭐" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActivePage(tab.id)}
                  style={{
                    padding: "12px 20px",
                    borderRadius: "10px",
                    border: "2px solid",
                    fontSize: "16px",
                    fontWeight: "700",
                    cursor: "pointer",
                    transition: "all 0.3s",
                    background: activePage === tab.id
                      ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                      : "white",
                    color: activePage === tab.id ? "white" : "#374151",
                    borderColor: activePage === tab.id ? "transparent" : "#e5e7eb",
                    boxShadow: activePage === tab.id ? "0 4px 12px rgba(102, 126, 234, 0.3)" : "none"
                  }}
                  onMouseEnter={(e) => {
                    if (activePage !== tab.id) {
                      e.target.style.borderColor = "#667eea";
                      e.target.style.background = "#f0f4ff";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activePage !== tab.id) {
                      e.target.style.borderColor = "#e5e7eb";
                      e.target.style.background = "white";
                    }
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* Page Content */}
          {selectedClass && selectedSection ? (
            renderContent()
          ) : (
            <div style={{
              background: "white",
              padding: "60px 48px",
              borderRadius: "16px",
              textAlign: "center",
              color: "#9ca3af",
              fontSize: "20px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.08)"
            }}>
              📚 Please select a class and section to get started
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default FacultyDashboard;
