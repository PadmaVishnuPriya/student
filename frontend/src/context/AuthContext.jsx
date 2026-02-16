import React, { createContext, useState, useEffect } from 'react'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userType = localStorage.getItem('userType')
    const userName = localStorage.getItem('userName')
    const userId = localStorage.getItem('userId')
    
    if (token && userType) {
      setUserState({
        token,
        userType,
        name: userName || 'User',
        id: userId
      })
    }
    setLoading(false)
  }, [])

  const setUser = (userData) => {
    setUserState(userData)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userType')
    localStorage.removeItem('userName')
    localStorage.removeItem('userId')
    setUserState(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}
