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

  useEffect(() => {
    const loadData = async () => {
      await fetchStudents()
      await fetchMetrics()
      setLoading(false)
    }
    loadData()
    // Listen for global updates (e.g., faculty added metrics or students)
    const onUpdate = async () => {
      await fetchStudents()
      await fetchMetrics()
    }
    window.addEventListener('dataUpdated', onUpdate)
    return () => window.removeEventListener('dataUpdated', onUpdate)
  }, [])

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/users/students`, {
        headers: { Authorization: `Bearer ${token}` }
      })

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
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/metrics`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      // Group metrics by student
      const metricsbyStudent = {}
      if (response.data && Array.isArray(response.data)) {
        response.data.forEach(metric => {
          const studentId = metric.studentId?._id || metric.studentId
          if (!metricsbyStudent[studentId]) {
            metricsbyStudent[studentId] = []
          }
          metricsbyStudent[studentId].push(metric)
        })
      }
      setMetrics(metricsbyStudent)
    } catch (err) {
      console.log('Metrics not available:', err.message)
    }
  }

  // Calculate trust scores based on metrics
  const getStudentScore = (studentId) => {
    const studentMetrics = metrics[studentId]
    if (!studentMetrics || studentMetrics.length === 0) {
      return 0
    }
    const latestMetric = studentMetrics[studentMetrics.length - 1]
    return latestMetric.trustScore || 0
  }

  // Add trust scores to students and sort
  const studentsWithScores = students.map(student => ({
    ...student,
    trustScore: getStudentScore(student._id)
  })).sort((a, b) => b.trustScore - a.trustScore)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const averageTrustScore = studentsWithScores.length > 0
    ? Math.round(studentsWithScores.reduce((sum, s) => sum + s.trustScore, 0) / studentsWithScores.length)
    : 0

  const topStudents = studentsWithScores.slice(0, 3)
  const lowStudents = studentsWithScores.slice(-3).reverse()

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
          <h2>Your Trust Score</h2>
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
              <h3>Your Rank</h3>
              <p className="rank-number">#{studentsWithScores.findIndex(s => s._id === currentUser._id) + 1} / {studentsWithScores.length}</p>
            </div>
          </div>
        </div>
      )}

      {/* Rankings */}
      <div className="rankings-section">
        <div className="ranking-container">
          <h2>🏆 Top 3 Students</h2>
          <div className="students-grid">
            {topStudents.map((student, index) => (
              <div key={student._id} className="student-card top-card">
                <div className="medal">{'🥇🥈🥉'[index]}</div>
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
          <h2>📉 Students Needing Improvement</h2>
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

      {/* All Students Leaderboard */}
      <div className="leaderboard-section">
        <h2>📊 All Students Leaderboard</h2>
        <div className="leaderboard-table">
          <div className="table-header">
            <div className="col-rank">Rank</div>
            <div className="col-name">Name</div>
            <div className="col-score">Trust Score</div>
            <div className="col-trend">Trend</div>
          </div>
          {studentsWithScores.map((student, index) => (
            <div key={student._id} className="table-row">
              <div className="col-rank">#{index + 1}</div>
              <div className="col-name">
                <div className="student-info">
                  <div className="avatar">{student.name.charAt(0).toUpperCase()}</div>
                  <span>{student.name}</span>
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
    </div>
  )
}

export default StudentDashboard
