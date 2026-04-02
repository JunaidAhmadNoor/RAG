import { Navigate } from 'react-router-dom'
import { authStore } from '../store/authStore'

/**
 * role: require exact role (e.g. 'admin')
 * requireUpload: admin or user with can_upload from login
 */
const ProtectedRoute = ({ children, role, requireUpload }) => {
  const { accessToken, role: currentRole, canUpload } = authStore()

  if (!accessToken) return <Navigate to="/login" replace />

  if (role && currentRole !== role) return <Navigate to="/chat" replace />

  if (requireUpload) {
    const allowed = currentRole === 'admin' || canUpload
    if (!allowed) return <Navigate to="/chat" replace />
  }

  return children
}

export default ProtectedRoute
