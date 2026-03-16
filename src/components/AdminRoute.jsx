import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const AdminRoute = ({ children }) => {
  const { currentUser, authLoading } = useAuth()

  if (authLoading) return null

  if (!currentUser || currentUser.role !== 'admin') {
    return <Navigate to="/login" replace />
  }

  return children
}

export default AdminRoute
