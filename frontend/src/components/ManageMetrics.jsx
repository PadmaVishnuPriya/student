import React, { useState } from "react";
import axios from "axios";

const ManageMetrics = ({ selectedClass, selectedSection, students }) => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [formData, setFormData] = useState({
    daysAttended: "",
    totalDays: "",
    examMarks: "",
    submittedAssignments: "",
    totalAssignments: "",
    sportsParticipation: "",
    totalSportsActivities: "",
    extraCurricularParticipation: "",
    totalExtraCurricularActivities: "",
    firstPrize: "",
    secondPrize: "",
    thirdPrize: ""
  });

  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "8px",
    border: "2px solid #e5e7eb",
    fontSize: "16px",
    boxSizing: "border-box",
    fontFamily: "inherit"
  };

  const labelStyle = {
    display: "block",
    fontSize: "16px",
    fontWeight: "700",
    color: "#374151",
    marginBottom: "8px"
  };

  const sectionTitleStyle = {
    fontSize: "20px",
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: "16px",
    paddingBottom: "12px",
    borderBottom: "2px solid #f0f4ff"
  };

  const handleAddMetrics = async (e) => {
    e.preventDefault();
    if (!selectedStudent) {
      setError("Please select a student");
      return;
    }

    const daysAttended = parseFloat(formData.daysAttended);
    const totalDays = parseFloat(formData.totalDays);
    const exams = formData.examMarks.split(",").map((m) => parseFloat(m.trim())).filter((n) => !isNaN(n));
    const submittedAssignments = parseFloat(formData.submittedAssignments);
    const totalAssignments = parseFloat(formData.totalAssignments);
    const sportsParticipation = parseFloat(formData.sportsParticipation);
    const totalSportsActivities = parseFloat(formData.totalSportsActivities);
    const extraCurricularParticipation = parseFloat(formData.extraCurricularParticipation);
    const totalExtraCurricularActivities = parseFloat(formData.totalExtraCurricularActivities);
    const firstPrize = parseFloat(formData.firstPrize || 0);
    const secondPrize = parseFloat(formData.secondPrize || 0);
    const thirdPrize = parseFloat(formData.thirdPrize || 0);

    if (isNaN(daysAttended) || isNaN(totalDays) || daysAttended > totalDays) {
      setError("Invalid attendance data");
      return;
    }
    if (exams.length === 0) {
      setError("Please provide at least one exam mark");
      return;
    }
    if (isNaN(submittedAssignments) || isNaN(totalAssignments) || submittedAssignments > totalAssignments) {
      setError("Invalid assignment data");
      return;
    }
    if (isNaN(sportsParticipation) || isNaN(totalSportsActivities) || sportsParticipation > totalSportsActivities) {
      setError("Invalid sports data");
      return;
    }
    if (
      isNaN(extraCurricularParticipation) ||
      isNaN(totalExtraCurricularActivities) ||
      extraCurricularParticipation > totalExtraCurricularActivities
    ) {
      setError("Invalid extra-curricular data");
      return;
    }
    if ([firstPrize, secondPrize, thirdPrize].some((value) => isNaN(value) || value < 0)) {
      setError("Invalid rewards data");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const resp = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/metrics`,
        {
          studentId: selectedStudent._id,
          attendance: { daysAttended, totalDays },
          exams,
          assignments: { submittedOnTime: submittedAssignments, totalAssignments },
          sports: { participation: sportsParticipation, totalActivities: totalSportsActivities },
          extraCurricular: {
            participation: extraCurricularParticipation,
            totalActivities: totalExtraCurricularActivities
          },
          rewards: { firstPrize, secondPrize, thirdPrize }
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const trustScore = resp.data?.trustScore;
      const rewardBonus = resp.data?.rewardBonus || 0;
      setSuccessMsg(`Metrics added! Final Trust Score: ${trustScore} (Rewards Bonus: +${rewardBonus}%)`);
      setFormData({
        daysAttended: "",
        totalDays: "",
        examMarks: "",
        submittedAssignments: "",
        totalAssignments: "",
        sportsParticipation: "",
        totalSportsActivities: "",
        extraCurricularParticipation: "",
        totalExtraCurricularActivities: "",
        firstPrize: "",
        secondPrize: "",
        thirdPrize: ""
      });
      setError("");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(`Failed to add metrics: ${msg}`);
    }
  };

  if (!selectedClass || !selectedSection) {
    return (
      <div style={{ background: "white", padding: "60px 48px", borderRadius: "20px", textAlign: "center", color: "#9ca3af", fontSize: "24px" }}>
        Please select a class and section first
      </div>
    );
  }

  return (
    <div style={{ background: "white", padding: "48px", borderRadius: "20px", boxShadow: "0 4px 16px rgba(0,0,0,0.08)", border: "2px solid #e5e7eb", maxWidth: "900px", margin: "0 auto" }}>
      <h2 style={{ margin: "0 0 32px 0", fontSize: "36px", fontWeight: "700", color: "#1f2937" }}>Enter Student Metrics</h2>

      {error && <div style={{ background: "#fee2e2", border: "1px solid #fecaca", color: "#991b1b", padding: "16px 20px", borderRadius: "12px", marginBottom: "20px", fontSize: "16px", fontWeight: "500" }}>{error}</div>}
      {successMsg && <div style={{ background: "#dcfce7", border: "1px solid #bbf7d0", color: "#166534", padding: "16px 20px", borderRadius: "12px", marginBottom: "20px", fontSize: "16px", fontWeight: "500" }}>{successMsg}</div>}

      <form onSubmit={handleAddMetrics}>
        <div style={{ marginBottom: "32px" }}>
          <label style={{ display: "block", fontSize: "20px", fontWeight: "700", color: "#374151", marginBottom: "12px" }}>Select Student *</label>
          <select
            value={selectedStudent?._id || ""}
            onChange={(e) => {
              const student = students.find((s) => s._id === e.target.value);
              setSelectedStudent(student);
            }}
            required
            style={{ width: "100%", padding: "16px 18px", borderRadius: "10px", border: "2px solid #e5e7eb", fontSize: "18px", cursor: "pointer", fontWeight: "600", boxSizing: "border-box", background: "white", transition: "all 0.2s" }}
          >
            <option value="">-- Choose a student --</option>
            {students.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        </div>

        {selectedStudent && <div style={{ background: "#f0f4ff", border: "2px solid #667eea", padding: "16px 20px", borderRadius: "10px", marginBottom: "24px", fontSize: "16px", fontWeight: "700", color: "#764ba2" }}>Selected: {selectedStudent.name}</div>}

        <div style={{ marginBottom: "32px" }}>
          <h3 style={sectionTitleStyle}>Attendance (20% Weight)</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div><label style={labelStyle}>Days Attended *</label><input type="number" placeholder="e.g., 180" value={formData.daysAttended} onChange={(e) => setFormData({ ...formData, daysAttended: e.target.value })} required style={inputStyle} /></div>
            <div><label style={labelStyle}>Total Days *</label><input type="number" placeholder="e.g., 200" value={formData.totalDays} onChange={(e) => setFormData({ ...formData, totalDays: e.target.value })} required style={inputStyle} /></div>
          </div>
        </div>

        <div style={{ marginBottom: "32px" }}>
          <h3 style={sectionTitleStyle}>Exam Marks (20% Weight)</h3>
          <label style={labelStyle}>Marks (Comma Separated) *</label>
          <input type="text" placeholder="e.g., 85, 90, 78" value={formData.examMarks} onChange={(e) => setFormData({ ...formData, examMarks: e.target.value })} required style={inputStyle} />
        </div>

        <div style={{ marginBottom: "32px" }}>
          <h3 style={sectionTitleStyle}>Assignments (20% Weight)</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div><label style={labelStyle}>Submitted On Time *</label><input type="number" placeholder="e.g., 18" value={formData.submittedAssignments} onChange={(e) => setFormData({ ...formData, submittedAssignments: e.target.value })} required style={inputStyle} /></div>
            <div><label style={labelStyle}>Total Assignments *</label><input type="number" placeholder="e.g., 20" value={formData.totalAssignments} onChange={(e) => setFormData({ ...formData, totalAssignments: e.target.value })} required style={inputStyle} /></div>
          </div>
        </div>

        <div style={{ marginBottom: "32px" }}>
          <h3 style={sectionTitleStyle}>Sports (20% Weight)</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div><label style={labelStyle}>Participated Activities *</label><input type="number" placeholder="e.g., 8" value={formData.sportsParticipation} onChange={(e) => setFormData({ ...formData, sportsParticipation: e.target.value })} required style={inputStyle} /></div>
            <div><label style={labelStyle}>Total Sports Activities *</label><input type="number" placeholder="e.g., 10" value={formData.totalSportsActivities} onChange={(e) => setFormData({ ...formData, totalSportsActivities: e.target.value })} required style={inputStyle} /></div>
          </div>
        </div>

        <div style={{ marginBottom: "32px" }}>
          <h3 style={sectionTitleStyle}>Extra-Curricular (20% Weight)</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div><label style={labelStyle}>Participated Activities *</label><input type="number" placeholder="e.g., 6" value={formData.extraCurricularParticipation} onChange={(e) => setFormData({ ...formData, extraCurricularParticipation: e.target.value })} required style={inputStyle} /></div>
            <div><label style={labelStyle}>Total Extra-Curricular Activities *</label><input type="number" placeholder="e.g., 10" value={formData.totalExtraCurricularActivities} onChange={(e) => setFormData({ ...formData, totalExtraCurricularActivities: e.target.value })} required style={inputStyle} /></div>
          </div>
        </div>

        <div style={{ marginBottom: "32px" }}>
          <h3 style={sectionTitleStyle}>Rewards Bonus (Add-on, not part of 100%)</h3>
          <p style={{ margin: "0 0 16px 0", color: "#6b7280", fontSize: "15px" }}>
            Recommended bonus: 1st prize = +5%, 2nd prize = +3%, 3rd prize = +2%, capped at +10% total.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
            <div><label style={labelStyle}>1st Prizes</label><input type="number" min="0" placeholder="e.g., 1" value={formData.firstPrize} onChange={(e) => setFormData({ ...formData, firstPrize: e.target.value })} style={inputStyle} /></div>
            <div><label style={labelStyle}>2nd Prizes</label><input type="number" min="0" placeholder="e.g., 0" value={formData.secondPrize} onChange={(e) => setFormData({ ...formData, secondPrize: e.target.value })} style={inputStyle} /></div>
            <div><label style={labelStyle}>3rd Prizes</label><input type="number" min="0" placeholder="e.g., 2" value={formData.thirdPrize} onChange={(e) => setFormData({ ...formData, thirdPrize: e.target.value })} style={inputStyle} /></div>
          </div>
        </div>

        <button type="submit" style={{ width: "100%", padding: "16px 24px", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", color: "white", border: "none", borderRadius: "10px", fontSize: "18px", fontWeight: "700", cursor: "pointer", transition: "all 0.3s", boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)" }} onMouseEnter={(e) => e.target.style.transform = "translateY(-2px)"} onMouseLeave={(e) => e.target.style.transform = "translateY(0)"}>
          Add Metrics & Calculate Trust Score
        </button>
      </form>
    </div>
  );
};

export default ManageMetrics;
