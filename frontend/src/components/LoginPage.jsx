import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { AuthContext } from '../context/AuthContext'
import '../styles/LoginPage.css'

const LoginPage = () => {
  const navigate = useNavigate()
  const { setUser } = useContext(AuthContext)
  const [userType, setUserType] = useState('student')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/users/login`, {
        email,
        password,
        userType,
      })

      // Store token in localStorage
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('userType', userType)
      localStorage.setItem('userName', response.data.user.name)
      localStorage.setItem('userId', response.data.user.id)
      // Store class & section for students (null-safe)
      const sc = response.data.user.studentClass
      const sec = response.data.user.section

      localStorage.setItem('studentClass', (sc !== null && sc !== undefined) ? sc : '')
      localStorage.setItem('section', sec || '')

      // Update AuthContext immediately
      setUser({
        token: response.data.token,
        userType: userType,
        name: response.data.user.name,
        id: response.data.user.id,
        studentClass: (sc !== null && sc !== undefined) ? Number(sc) : null,
        section: sec || null
      })

      // Redirect based on user type
      navigate(`/${userType}/dashboard`)
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (type) => {
    setUserType(type)
    setShowModal(true)
    setEmail('')
    setPassword('')
    setError('')
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEmail('')
    setPassword('')
    setError('')
  }

  const handleRegisterClick = (type) => {
    navigate(`/register?type=${type}`)
  }

  return (
    <div className="login-wrapper">
      <div className="content-container">

        {/* Left Side / Top Area (Hero + Stats) */}
        <div className="info-section">
          <div className="top-badge">
            <span className="badge-dot"></span> EST. 2001 • COIMBATORE
          </div>

          <div className="hero-section">
            <h1 className="title-adharsh">Adharsh</h1>
            <h1 className="title-vidhyala">Vidhyala</h1>
            <p className="hero-subtitle">
              Empowering students through transparent academic trust & performance tracking.
            </p>
          </div>

          <div className="stats-containment">
            <div className="stats-row">
              <div className="stat-block">
                <div className="stat-number">2.4<span className="stat-suffix">K</span></div>
                <div className="stat-label">STUDENTS</div>
              </div>
              <div className="stat-block">
                <div className="stat-number">180</div>
                <div className="stat-label">FACULTY</div>
              </div>
              <div className="stat-block">
                <div className="stat-number">96<span className="stat-suffix">%</span></div>
                <div className="stat-label">TRUST SCORE AVG</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side / Bottom Area (Login Card) */}
        <div className="main-card">
          <div className="card-top-bar">
            <div className="brand-logo">🎓</div>
            <div className="brand-titles">
              <h3>Secure Portal</h3>
              <p>SELECT YOUR ROLE TO CONTINUE</p>
            </div>
          </div>

          <div className="card-divider"></div>

          <div className="selection-label">I AM A</div>

          <div className="role-grid">
            <div
              className={`role-box ${userType === 'faculty' ? 'selected' : ''}`}
              onClick={() => { setUserType('faculty'); setError(''); }}
            >
              {userType === 'faculty' && <div className="selected-badge">✓</div>}
              <div className="role-emoji">👩‍🏫</div>
              <div className="role-title">Faculty</div>
            </div>

            <div
              className={`role-box ${userType === 'student' ? 'selected' : ''}`}
              onClick={() => { setUserType('student'); setError(''); }}
            >
              {userType === 'student' && <div className="selected-badge">✓</div>}
              <div className="role-emoji">🎓</div>
              <div className="role-title">Student</div>
            </div>
          </div>

          {/* Inline Login Form */}
          <div className="inline-login-form">
            <h3 className="form-title">
              Login as {userType.charAt(0).toUpperCase() + userType.slice(1)}
            </h3>

            <div className="form-alert-container">
              {error && <div className="error-message">{error}</div>}
            </div>

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-submit"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Sign In'}
              </button>
            </form>

            <p className="register-link">
              New to Adharsh Vidhyala? <a onClick={() => handleRegisterClick(userType)}>Create an account</a>
            </p>
          </div>
        </div>

      </div>

      <footer className="page-footer">
        © 2025 Adharsh Vidhyala • Student Trust Score System • All rights reserved
      </footer>
    </div>
  )
}

export default LoginPage