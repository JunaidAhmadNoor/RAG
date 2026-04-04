import { Navigate } from 'react-router-dom'
import { authStore } from '../store/authStore'

/**
 * role: require exact role (e.g. 'admin' or 'superadmin')
 * requireUpload: admin or user with can_upload from login
 * blockRoles: if current role is in this list, redirect to redirectIfBlocked
 */
const ProtectedRoute = ({ children, role, requireUpload, blockRoles, redirectIfBlocked = '/chat' }) => {
  const { accessToken, role: currentRole, canUpload } = authStore()

  if (!accessToken) return <Navigate to="/login" replace />

  if (blockRoles?.length && blockRoles.includes(currentRole)) {
    return <Navigate to={redirectIfBlocked} replace />
  }

  if (role && currentRole !== role) return <Navigate to={currentRole === 'superadmin' ? '/superadmin' : '/chat'} replace />

  if (requireUpload) {
    const allowed = currentRole === 'admin' || canUpload
    if (!allowed) return <Navigate to="/chat" replace />
  }

  return children
}

export default ProtectedRoute
