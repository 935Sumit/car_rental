import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  // Load user from localStorage when app starts
  useEffect(() => {
    const stored = localStorage.getItem('currentUser')
    if (stored) {
      try {
        setCurrentUser(JSON.parse(stored))
      } catch {
        localStorage.removeItem('currentUser')
      }
    }
    setAuthLoading(false)
  }, [])

  const login = (userData) => {
    localStorage.setItem('currentUser', JSON.stringify(userData))
    if (userData.role === 'admin') {
      localStorage.setItem('adminLoggedIn', 'true')
    }
    setCurrentUser(userData)
    // Trigger storage event so CarContext reloads saved cars
    window.dispatchEvent(new Event('storage'))
  }

  const logout = () => {
    localStorage.removeItem('currentUser')
    localStorage.removeItem('adminLoggedIn')
    setCurrentUser(null)
  }

  const isAdmin = currentUser?.role === 'admin'
  const isLoggedIn = !!currentUser

  return (
    <AuthContext.Provider value={{
      currentUser,
      login,
      logout,
      isAdmin,
      isLoggedIn,
      authLoading
    }}>
      {children}
    </AuthContext.Provider>
  )
}
