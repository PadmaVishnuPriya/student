import React, { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { AuthContext } from '../context/AuthContext'
import '../styles/StudentDashboard.css'

const StudentDashboard = () => {
  const navigate = useNavigate()
  const { user, logout } = useContext(AuthContext)
  const [students, setStudents] = useState([])
  const [metrics, setMetrics] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentUser, setCurrentUser] = useState(null)
  const [overallStudents, setOverallStudents] = useState([])
  const [overallMetrics, setOverallMetrics] = useState({})

  // Pull class & section from the logged-in user context
  const studentClass = user?.studentClass
  const section = user?.section

  // Build query string — used for all API calls
  const classQuery = studentClass && section
    ? `?class=${studentClass}&section=${section}`
    : ''

  const overallClassQuery = studentClass
    ? `?class=${studentClass}`
    : ''

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([
        fetchStudents(),
        fetchMetrics(),
        fetchOverallStudents(),
        fetchOverallMetrics()
      ])
      setLoading(false)
    }
    loadData()
    // Listen for global updates (e.g., faculty added metrics or students)
    const onUpdate = async () => {
      await Promise.all([
        fetchStudents(),
        fetchMetrics(),
        fetchOverallStudents(),
        fetchOverallMetrics()
      ])
    }
    window.addEventListener('dataUpdated', onUpdate)
    return () => window.removeEventListener('dataUpdated', onUpdate)
  }, [studentClass, section])

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/users/students${classQuery}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      const studentList = response.data || []
      setStudents(studentList)

      // Set current user based on stored userId
      const currentUserId = localStorage.getItem('userId') || user?.id
      const current = studentList.find(s => s._id === currentUserId)
      if (current) setCurrentUser(current)
    } catch (err) {
      console.log('Error loading students:', err.message)
      setError('Failed to load students')
    }
  }

  const fetchMetrics = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/metrics${classQuery}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      // Group metrics by student
      const metricsByStudent = {}
      if (response.data && Array.isArray(response.data)) {
        response.data.forEach(metric => {
          const sid = metric.studentId?._id || metric.studentId
          if (!metricsByStudent[sid]) metricsByStudent[sid] = []
          metricsByStudent[sid].push(metric)
        })
      }
      setMetrics(metricsByStudent)
    } catch (err) {
      console.log('Metrics not available:', err.message)
    }
  }

  const fetchOverallStudents = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/users/students${overallClassQuery}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setOverallStudents(response.data || [])
    } catch (err) {
      console.log('Error loading overall students:', err.message)
    }
  }

  const fetchOverallMetrics = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/metrics${overallClassQuery}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      const metricsByStudent = {}
      if (response.data && Array.isArray(response.data)) {
        response.data.forEach(metric => {
          const sid = metric.studentId?._id || metric.studentId
          if (!metricsByStudent[sid]) metricsByStudent[sid] = []
          metricsByStudent[sid].push(metric)
        })
      }
      setOverallMetrics(metricsByStudent)
    } catch (err) {
      console.log('Overall metrics not available:', err.message)
    }
  }

  // Calculate trust scores based on latest metric per student
  const getStudentScore = (studentId) => {
    const studentMetrics = metrics[studentId]
    if (!studentMetrics || studentMetrics.length === 0) return 0
    return studentMetrics[studentMetrics.length - 1].trustScore || 0
  }

  // Add trust scores and sort descending
  const studentsWithScores = students.map(student => ({
    ...student,
    trustScore: getStudentScore(student._id)
  })).sort((a, b) => b.trustScore - a.trustScore)

  const getOverallStudentScore = (studentId) => {
    const studentMetrics = overallMetrics[studentId]
    if (!studentMetrics || studentMetrics.length === 0) return 0
    return studentMetrics[studentMetrics.length - 1].trustScore || 0
  }

  const overallStudentsWithScores = overallStudents.map(student => ({
    ...student,
    trustScore: getOverallStudentScore(student._id)
  })).sort((a, b) => b.trustScore - a.trustScore)

  const overallTopStudents = overallStudentsWithScores.slice(0, 3)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const averageTrustScore = studentsWithScores.length > 0
    ? Math.round(studentsWithScores.reduce((sum, s) => sum + s.trustScore, 0) / studentsWithScores.length)
    : 0

  const topStudents = studentsWithScores.slice(0, 3)
  const lowStudents = studentsWithScores.slice(-3).reverse()

  // Scoped label for headings
  const scopeLabel = studentClass && section
    ? `Class ${studentClass} – Section ${section}`
    : 'Your Class'

  if (loading) return <div className="loading">Loading...</div>

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1>🎓 Adharsh Vidhyalaya</h1>
          <p>Student Trust Score Management</p>
        </div>
        <div className="header-right">
          <div className="user-info">
            <span>{user?.name}</span>
            <button className="btn-logout" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </div>

      {/* Class/Section badge */}
      <div style={{
        display: 'inline-block', background: 'rgba(255,255,255,0.18)',
        borderRadius: 20, padding: '5px 16px', marginBottom: 18,
        color: '#fff', fontWeight: 700, fontSize: '0.9rem',
        border: '1.5px solid rgba(255,255,255,0.3)'
      }}>
        📚 {scopeLabel}
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* Key Metrics */}
      <div className="metrics-section">
        <div className="metric-card">
          <div className="metric-number">{studentsWithScores.length}</div>
          <div className="metric-label">Total Students</div>
        </div>
        <div className="metric-card">
          <div className="metric-number">{averageTrustScore}%</div>
          <div className="metric-label">Average Trust Score</div>
        </div>
        <div className="metric-card">
          <div className="metric-number">{topStudents[0]?.trustScore || 0}%</div>
          <div className="metric-label">Highest Score</div>
        </div>
        <div className="metric-card">
          <div className="metric-number">{lowStudents[0]?.trustScore || 0}%</div>
          <div className="metric-label">Lowest Score</div>
        </div>
      </div>

      {/* Your Score */}
      {currentUser && (
        <div className="your-score-section">
          <h2>Your Trust Score — {scopeLabel}</h2>
          <div className="score-display">
            <div className="circular-progress">
              <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" className="background-circle" />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  className="progress-circle"
                  style={{ strokeDasharray: `${currentUser.trustScore * 2.827}, 282.7` }}
                />
              </svg>
              <div className="score-text">{currentUser.trustScore}%</div>
            </div>
            <div className="rank-info">
              <h3>Your Rank in {scopeLabel}</h3>
              <p className="rank-number">
                #{studentsWithScores.findIndex(s => s._id === currentUser._id) + 1} / {studentsWithScores.length}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Rankings */}
      <div className="rankings-section">
        <div className="ranking-container">
          <h2>🏆 Top 3 — {scopeLabel}</h2>
          <div className="students-grid">
            {topStudents.map((student, index) => (
              <div key={student._id} className="student-card top-card">
                <div className="medal">
                  {['🥇', '🥈', '🥉'][index]}
                  <span className="medal-label">
                    {index === 0 ? 'Gold Medal' : index === 1 ? 'Silver Medal' : 'Bronze Medal'}
                  </span>
                </div>
                <div className="student-avatar">
                  {student.name.charAt(0).toUpperCase()}
                </div>
                <div className="student-name">{student.name}</div>
                <div className="student-score">{student.trustScore}%</div>
                <div className="score-bar">
                  <div className="score-fill" style={{ width: `${student.trustScore}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="ranking-container">
          <h2>📉 Students Needing Improvement — {scopeLabel}</h2>
          <div className="students-grid">
            {lowStudents.map((student) => (
              <div key={student._id} className="student-card low-card">
                <div className="student-avatar">
                  {student.name.charAt(0).toUpperCase()}
                </div>
                <div className="student-name">{student.name}</div>
                <div className="student-score">{student.trustScore}%</div>
                <div className="score-bar">
                  <div className="score-fill" style={{ width: `${student.trustScore}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Leaderboard — scoped to class/section */}
      <div className="leaderboard-section">
        <h2>📊 {scopeLabel} Leaderboard</h2>
        <div className="leaderboard-table">
          <div className="table-header">
            <div className="col-rank">Rank</div>
            <div className="col-name">Name</div>
            <div className="col-score">Trust Score</div>
            <div className="col-trend">Trend</div>
          </div>
          {studentsWithScores.map((student, index) => (
            <div
              key={student._id}
              className={`table-row${student._id === currentUser?._id ? ' highlight-row' : ''}`}
              style={student._id === currentUser?._id
                ? { background: 'rgba(255,255,255,0.15)', borderRadius: 8 }
                : {}}
            >
              <div className="col-rank">#{index + 1}</div>
              <div className="col-name">
                <div className="student-info">
                  <div className="avatar">{student.name.charAt(0).toUpperCase()}</div>
                  <span>
                    {student.name}
                    {student._id === currentUser?._id && (
                      <span style={{ marginLeft: 6, fontSize: '0.75rem', opacity: 0.8 }}>(You)</span>
                    )}
                  </span>
                </div>
              </div>
              <div className="col-score">
                <span className="score-badge">{student.trustScore}%</span>
              </div>
              <div className="col-trend">
                <span className="trend-up">↑</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Overall Class Leaderboard */}
      <div className="rankings-section" style={{ marginTop: 40, borderTop: '2px dashed rgba(255,255,255,0.1)', paddingTop: 40 }}>
        <div className="ranking-container" style={{ maxWidth: '100%', width: '100%' }}>
          <h2 style={{ textAlign: 'center', marginBottom: 30 }}>🏆 Top 3 — Overall Class {studentClass} (All Sections)</h2>
          <div className="students-grid" style={{ justifyContent: 'center' }}>
            {overallTopStudents.map((student, index) => (
              <div key={student._id} className="student-card top-card" style={{ minWidth: 250 }}>
                <div className="medal">
                  {['🥇', '🥈', '🥉'][index]}
                  <span className="medal-label">
                    {index === 0 ? 'Gold Medal' : index === 1 ? 'Silver Medal' : 'Bronze Medal'}
                  </span>
                </div>
                <div className="student-avatar">
                  {student.name.charAt(0).toUpperCase()}
                </div>
                <div className="student-name">{student.name}</div>
                <div className="student-info" style={{ marginBottom: 10, opacity: 0.8 }}>
                  Section {student.section}
                </div>
                <div className="student-score">{student.trustScore}%</div>
                <div className="score-bar">
                  <div className="score-fill" style={{ width: `${student.trustScore}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard
