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
    const studentClassRaw = localStorage.getItem('studentClass')
    const sectionRaw = localStorage.getItem('section')

    if (token && userType) {
      // Fix: Handle 'null' string from localStorage and ensure valid Number or null
      const parsedClassNum = studentClassRaw && studentClassRaw !== 'null' && studentClassRaw !== ''
        ? Number(studentClassRaw)
        : null

      const parsedSection = (sectionRaw && sectionRaw !== 'null' && sectionRaw !== '')
        ? sectionRaw
        : null

      setUserState({
        token,
        userType,
        name: userName || 'User',
        id: userId,
        studentClass: (parsedClassNum !== null && !isNaN(parsedClassNum)) ? parsedClassNum : null,
        section: parsedSection
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
    localStorage.removeItem('studentClass')
    localStorage.removeItem('section')
    setUserState(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}
