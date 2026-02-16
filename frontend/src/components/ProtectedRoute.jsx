import React, { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useContext(AuthContext)

  if (loading) {
    return <div className="loading-spinner">Loading...</div>
  }

  if (!user) {
    return <Navigate to="/" />
  }

  if (requiredRole && user.userType !== requiredRole) {
    return <Navigate to="/" />
  }

  return children
}

export default ProtectedRoute
