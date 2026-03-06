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
    <div className="login-container">
      <div className="login-header">
        <h1>Adharsh Vidhyala</h1>
        <h2>Student Trust Score System</h2>
      </div>
      <div className="login-cards">
        {/* Admin login card removed */}

        <div className="login-card faculty-card">
          <div className="card-content">
            <h2>Faculty</h2>
            <button
              className="btn btn-primary"
              onClick={() => handleOpenModal('faculty')}
            >
              Login
            </button>
          </div>
        </div>

        <div className="login-card student-card">
          <div className="card-content">
            <h2>Student</h2>
            <button
              className="btn btn-primary"
              onClick={() => handleOpenModal('student')}
            >
              Login
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="login-modal show">
          <div className="modal-content">
            <button
              className="close-btn"
              onClick={handleCloseModal}
            >
              ✕
            </button>

            <h2>Login as {userType.charAt(0).toUpperCase() + userType.slice(1)}</h2>

            {error && <div className="error-message">{error}</div>}

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
                className="btn btn-submit"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <p className="register-link">
              Don't have an account? <a onClick={() => handleRegisterClick(userType)}>Register here</a>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default LoginPage