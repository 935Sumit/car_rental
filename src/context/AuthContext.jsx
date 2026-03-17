import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../supabase/supabaseClient'

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

  const login = async (userData) => {
    // 🔍 Smart License Recovery
    let license = userData.licenseNumber || userData.license_number
    
    // Fallback 1: LocalStorage backup (survives logout)
    if (!license) {
      license = localStorage.getItem(`lic_backup_${userData.email}`)
    }

    // Fallback 2: Check latest booking (database backup)
    if (!license && userData.id) {
       try {
         const { data } = await supabase
           .from('bookings')
           .select('licenseNumber')
           .eq('userEmail', userData.email)
           .order('id', { ascending: false })
           .limit(1)
         if (data?.[0]?.licenseNumber) {
           license = data[0].licenseNumber
           // Update backup
           localStorage.setItem(`lic_backup_${userData.email}`, license)
         }
       } catch (e) { console.warn('Booking backup lookup failed:', e) }
    }

    const finalUser = { ...userData, licenseNumber: license }

    localStorage.setItem('currentUser', JSON.stringify(finalUser))
    if (finalUser.role === 'admin') {
      localStorage.setItem('adminLoggedIn', 'true')
    }
    setCurrentUser(finalUser)
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

  const updateUser = (updatedData) => {
    const merged = { ...currentUser, ...updatedData }
    
    // Update license backup if changed
    if (updatedData.licenseNumber && merged.email) {
      localStorage.setItem(`lic_backup_${merged.email}`, updatedData.licenseNumber)
    }

    localStorage.setItem('currentUser', JSON.stringify(merged))
    setCurrentUser(merged)
  }

  return (
    <AuthContext.Provider value={{
      currentUser,
      login,
      logout,
      updateUser,
      isAdmin,
      isLoggedIn,
      authLoading
    }}>
      {children}
    </AuthContext.Provider>
  )
}
