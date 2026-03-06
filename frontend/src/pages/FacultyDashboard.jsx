import React, { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { AuthContext } from '../context/AuthContext'
import '../styles/FacultyDashboard.css'

// Helper: format date
function formatDate(dt) {
  if (!dt) return ''
  return new Date(dt).toLocaleString()
}

const CLASSES = [6, 7, 8, 9, 10]
const SECTIONS = ['A', 'B', 'C']

const FacultyDashboard = () => {
  const navigate = useNavigate()
  const { user, logout } = useContext(AuthContext)

  // Class & Section selectors — must both be chosen before data loads
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSection, setSelectedSection] = useState('')

  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showAddStudent, setShowAddStudent] = useState(false)
  const [metricsForm, setMetricsForm] = useState({
    daysAttended: '',
    totalDays: '',
    examMarks: '', // comma separated
    submittedAssignments: '',
    totalAssignments: '',
  })
  const [newStudentForm, setNewStudentForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showDebug, setShowDebug] = useState(false)
  const [metricsList, setMetricsList] = useState([])

  // Load data on mount or when selectors change
  useEffect(() => {
    fetchStudents()
    fetchMetrics()
  }, [selectedClass, selectedSection])
  const fetchMetrics = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/metrics?class=${selectedClass}&section=${selectedSection}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setMetricsList(response.data || [])
    } catch (err) {
      // ignore for now
    }
  }

  const fetchStudents = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/users/students?class=${selectedClass}&section=${selectedSection}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const sortedStudents = (response.data || []).sort((a, b) => a.name.localeCompare(b.name))
      setStudents(sortedStudents)
    } catch (err) {
      console.error("Fetch Students Error:", err);
      if (err.message === "Network Error") {
        setError(`Cannot connect to server at ${import.meta.env.VITE_API_BASE_URL}. Is it running?`)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAddStudent = async (e) => {
    e.preventDefault()

    if (newStudentForm.password !== newStudentForm.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    try {
      console.log("Attempting to add student to:", `${import.meta.env.VITE_API_BASE_URL}/api/users/register`);
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/users/register`,
        {
          name: newStudentForm.name,
          email: newStudentForm.email,
          password: newStudentForm.password,
          userType: 'student',
          studentClass: selectedClass,
          section: selectedSection
        }
      )

      // Backend returns created user under response.data.user (with `id`)
      const created = response.data.user
      const createdUser = {
        _id: created.id,
        name: created.name,
        email: created.email,
        role: created.role || 'student',
        studentClass: created.studentClass,
        section: created.section
      }

      // Prepend to students list so UI updates immediately
      setStudents(prev => [...prev, createdUser].sort((a, b) => a.name.localeCompare(b.name)))
      setSelectedStudent(createdUser)

      setSuccessMsg('Student added successfully!')
      setNewStudentForm({ name: '', email: '', password: '', confirmPassword: '' })
      setShowAddStudent(false)

      // Also refresh in background to keep in sync
      fetchStudents()
      fetchMetrics()
      // Notify other views (student dashboard) to refresh data
      try { window.dispatchEvent(new CustomEvent('dataUpdated')) } catch (e) { }

      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err) {
      console.error("Add Student Error:", err);
      const msg = err.response?.data?.message || err.message || 'Failed to add student';
      setError(`Failed: ${msg}`);
    }
  }

  const handleAddMetrics = async (e) => {
    e.preventDefault()
    if (!selectedStudent) {
      setError('Please select a student')
      return
    }

    // Parse inputs
    const daysAttended = parseFloat(metricsForm.daysAttended)
    const totalDays = parseFloat(metricsForm.totalDays)

    // Parse exams: split by comma, filter empty, map to number
    const exams = metricsForm.examMarks.split(',').map(m => parseFloat(m.trim())).filter(n => !isNaN(n))

    const submittedAssignments = parseFloat(metricsForm.submittedAssignments)
    const totalAssignments = parseFloat(metricsForm.totalAssignments)

    // Basic Validation
    if (isNaN(daysAttended) || isNaN(totalDays) || daysAttended > totalDays) {
      setError('Invalid attendance data')
      return
    }
    if (exams.length === 0) {
      setError('Please provide at least one exam mark')
      return
    }
    if (isNaN(submittedAssignments) || isNaN(totalAssignments) || submittedAssignments > totalAssignments) {
      setError('Invalid assignment data')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const resp = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/metrics`,
        {
          studentId: selectedStudent._id,
          attendance: { daysAttended, totalDays },
          exams,
          assignments: { submittedOnTime: submittedAssignments, totalAssignments },
          // improvement is now calculated automatically in backend
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      const returnedScore = resp.data?.trustScore
      setSuccessMsg(returnedScore ? `Metrics added — Trust Score: ${returnedScore}` : 'Metrics added successfully!')

      // Reset form
      setMetricsForm({
        daysAttended: '',
        totalDays: '',
        examMarks: '',
        submittedAssignments: '',
        totalAssignments: '',
      })

      fetchStudents()
      fetchMetrics()
      try { window.dispatchEvent(new CustomEvent('dataUpdated')) } catch (e) { }

      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err) {
      const serverMsg = err.response?.data?.message
      const status = err.response?.status
      setError(serverMsg ? `${serverMsg} (${status})` : err.message || 'Failed to add metrics')
    }
  }

  const handleDeleteMetric = async (metricId) => {
    if (!window.confirm('Are you sure you want to delete this metric entry?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/metrics/${metricId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccessMsg('Metric deleted successfully');
      setMetricsList(prev => prev.filter(m => m._id !== metricId));
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error("Delete Metric Error:", err);
      setError('Failed to delete metric');
    }
  };

  const handleDeleteStudent = async (studentId) => {
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/users/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setStudents(prev => prev.filter(s => s._id !== studentId))
      if (selectedStudent?._id === studentId) {
        setSelectedStudent(null)
      }
      setSuccessMsg('Student deleted successfully')
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err) {
      console.error("Delete error:", err);
      const status = err.response?.status;
      const msg = err.response?.data?.message;
      setError(msg ? `Error ${status}: ${msg}` : `Failed to delete student: ${err.message}`);
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  if (loading) return <div className="loading">Loading...</div>

  return (
    <div className="faculty-container">
      {/* Header */}
      <div className="faculty-header">
        <div className="header-left">
          <h1>👨‍🏫 Faculty Dashboard</h1>
          <p>Manage Student Metrics & Trust Scores</p>
        </div>
        <div className="header-right">
          <div className="user-info">
            <span>{user?.name}</span>
            <button className="btn-logout" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {successMsg && <div className="success-banner">{successMsg}</div>}

      {/* ── Class & Section Selector ── */}
      <div className="class-section-selector" style={{
        display: 'flex', alignItems: 'center', gap: 16,
        background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)',
        border: '1.5px solid rgba(255,255,255,0.25)', borderRadius: 12,
        padding: '14px 20px', margin: '0 0 20px 0', flexWrap: 'wrap'
      }}>
        <span style={{ fontWeight: 600, fontSize: '1rem', color: '#fff', marginRight: 8 }}>
          📚 Select Class & Section:
        </span>
        <select
          value={selectedClass}
          onChange={e => { setSelectedClass(e.target.value); setSelectedSection(''); setSelectedStudent(null) }}
          style={{
            padding: '8px 14px', borderRadius: 8,
            border: '2px solid #7c6ff7',
            background: '#fff', color: '#333',
            fontSize: '0.95rem', fontWeight: 600,
            cursor: 'pointer', minWidth: 140
          }}
        >
          <option value="">-- Select Class --</option>
          {CLASSES.map(c => (
            <option key={c} value={c}>Class {c}</option>
          ))}
        </select>

        <select
          value={selectedSection}
          disabled={!selectedClass}
          onChange={e => { setSelectedSection(e.target.value); setSelectedStudent(null) }}
          style={{
            padding: '8px 14px', borderRadius: 8,
            border: '2px solid #7c6ff7',
            background: selectedClass ? '#fff' : '#e8e8e8',
            color: selectedClass ? '#333' : '#999',
            fontSize: '0.95rem', fontWeight: 600,
            cursor: selectedClass ? 'pointer' : 'not-allowed', minWidth: 150,
            opacity: selectedClass ? 1 : 0.7
          }}
        >
          <option value="">-- Select Section --</option>
          {SECTIONS.map(s => (
            <option key={s} value={s}>Section {s}</option>
          ))}
        </select>

        {selectedClass && selectedSection && (
          <span style={{
            background: 'rgba(255,255,255,0.2)', borderRadius: 20,
            padding: '5px 14px', color: '#fff', fontWeight: 700, fontSize: '0.9rem'
          }}>
            📋 Class {selectedClass} – Section {selectedSection}
          </span>
        )}
      </div>

      <div className="faculty-content">
        {/* Add Student Section */}
        <div className="add-student-section">
          <div className="section-header">
            <h2>Add New Student — Class {selectedClass}, Section {selectedSection}</h2>
            <button
              className="btn-toggle"
              onClick={() => setShowAddStudent(!showAddStudent)}
            >
              {showAddStudent ? '✕ Close' : '+ Add Student'}
            </button>
          </div>

          {showAddStudent && (
            <form onSubmit={handleAddStudent} className="student-form">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  placeholder="Enter student name"
                  value={newStudentForm.name}
                  onChange={(e) => {
                    setError('')
                    setNewStudentForm({ ...newStudentForm, name: e.target.value })
                  }}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="Enter student email"
                  value={newStudentForm.email}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    placeholder="Enter password"
                    value={newStudentForm.password}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, password: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    placeholder="Confirm password"
                    value={newStudentForm.confirmPassword}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, confirmPassword: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Class & Section are pre-filled from the selector — shown as read-only info */}
              <div className="form-row">
                <div className="form-group">
                  <label>Class (auto-filled)</label>
                  <input type="text" value={`Class ${selectedClass}`} readOnly
                    style={{ background: 'rgba(255,255,255,0.1)', cursor: 'not-allowed', opacity: 0.8 }} />
                </div>
                <div className="form-group">
                  <label>Section (auto-filled)</label>
                  <input type="text" value={`Section ${selectedSection}`} readOnly
                    style={{ background: 'rgba(255,255,255,0.1)', cursor: 'not-allowed', opacity: 0.8 }} />
                </div>
              </div>

              <button type="submit" className="btn-submit">Create Student</button>
            </form>
          )}
        </div>

        {/* Add Metrics Form */}
        <div className="metrics-form-section">
          <h2>Add Student Metrics (Total Students: {students.length})</h2>

          <form onSubmit={handleAddMetrics} className="metrics-form">
            <div className="form-group">
              <label>Select Student (Total: {students.length})</label>
              <select
                value={selectedStudent?._id || ''}
                onChange={(e) => {
                  const student = students.find(s => s._id === e.target.value)
                  setSelectedStudent(student)
                }}
                required
              >
                <option value="">-- Choose a student --</option>
                {students.map(student => (
                  <option key={student._id} value={student._id}>
                    {student.name} ({student.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Attendance */}
            <h3>1. Attendance (A) - 35%</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Days Attended</label>
                <input
                  type="number"
                  placeholder="e.g. 180"
                  value={metricsForm.daysAttended}
                  onChange={(e) => setMetricsForm({ ...metricsForm, daysAttended: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Total School Days</label>
                <input
                  type="number"
                  placeholder="e.g. 200"
                  value={metricsForm.totalDays}
                  onChange={(e) => setMetricsForm({ ...metricsForm, totalDays: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Exams */}
            <h3>2. Exam Average (E) - 30%</h3>
            <div className="form-group">
              <label>Exam Marks (comma separated)</label>
              <input
                type="text"
                placeholder="e.g. 78, 82, 90"
                value={metricsForm.examMarks}
                onChange={(e) => setMetricsForm({ ...metricsForm, examMarks: e.target.value })}
                required
              />
            </div>

            {/* Assignments */}
            <h3>3. Assignment Score (AS) - 25%</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Assignments Submitted On Time</label>
                <input
                  type="number"
                  placeholder="e.g. 18"
                  value={metricsForm.submittedAssignments}
                  onChange={(e) => setMetricsForm({ ...metricsForm, submittedAssignments: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Total Assignments</label>
                <input
                  type="number"
                  placeholder="e.g. 20"
                  value={metricsForm.totalAssignments}
                  onChange={(e) => setMetricsForm({ ...metricsForm, totalAssignments: e.target.value })}
                  required
                />
              </div>
            </div>

            <p className="hint" style={{ fontSize: '0.9em', color: '#666', marginBottom: 15 }}>
              * Improvement Score will be calculated automatically based on previous metrics.
            </p>

            <button type="submit" className="btn-submit">Add Metrics & Calculate Trust Score</button>
          </form>
        </div>

        {/* Students List */}
        <div className="students-list-section">
          <h2>Students List — Class {selectedClass}, Section {selectedSection} (Total: {students.length})</h2>
          <div className="students-list">
            {students.map(student => (
              <div
                key={student._id}
                className={`student-item ${selectedStudent?._id === student._id ? 'selected' : ''}`}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', borderBottom: '1px solid #eee', padding: '8px 0' }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }} onClick={() => setSelectedStudent(student)}>
                  <div className="student-avatar">
                    {student.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="student-details">
                    <div className="student-name">{student.name}</div>
                    <div className="student-email">{student.email}</div>
                  </div>
                </div>
                <div
                  className="delete-icon"
                  style={{ color: 'red', cursor: 'pointer', marginLeft: 15 }}
                  title="Delete Student"
                  onClick={e => {
                    e.stopPropagation();
                    if (window.confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
                      handleDeleteStudent(student._id);
                    }
                  }}
                >
                  🗑️
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Metrics Table */}
        <div className="metrics-table-section">
          <h2>Recent Metrics</h2>
          <div className="metrics-table-scroll">
            <table className="metrics-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Attendance %</th>
                  <th>Exam Avg</th>
                  <th>Assignment %</th>
                  <th>Prev Avg</th>
                  <th>Curr Avg</th>
                  <th>Improvement</th>
                  <th>Trust Score</th>
                  <th>Added</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {metricsList.slice().reverse().slice(0, 10).map(m => (
                  <tr key={m._id}>
                    <td>{m.studentId?.name || m.studentId || '-'}</td>
                    <td>{m.attendance?.percentage || '-'}</td>
                    <td>{m.examAverage || '-'}</td>
                    <td>{m.assignments?.percentage || '-'}</td>
                    <td>{m.improvement?.previousAvg || '0'}</td>
                    <td>{m.improvement?.currentAvg || '-'}</td>
                    <td>{m.improvement?.score || '-'}</td>
                    <td><b>{m.trustScore}</b></td>
                    <td>{formatDate(m.createdAt)}</td>
                    <td>
                      <span
                        onClick={() => handleDeleteMetric(m._id)}
                        style={{ cursor: 'pointer', marginLeft: 10, color: 'red' }}
                        title="Delete Metric"
                      >
                        🗑️
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Debug Panel */}
      <div style={{ marginTop: 16 }}>
        <button className="btn-toggle" onClick={() => setShowDebug(s => !s)}>{showDebug ? 'Hide Debug' : 'Show Debug'}</button>
        {showDebug && (
          <div style={{ background: 'rgba(255,255,255,0.95)', padding: 12, marginTop: 12, borderRadius: 8 }}>
            <strong>Last Error:</strong>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{error || 'none'}</pre>
            <strong>Students (raw):</strong>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(students, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  )
}

export default FacultyDashboard
