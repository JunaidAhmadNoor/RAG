import { Navigate, Route, Routes } from 'react-router-dom'
import { BrowserRouter } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './layout/AppLayout'
import AdminDocumentsPage from './pages/AdminDocumentsPage'
import AdminUploadPage from './pages/AdminUploadPage'
import AdminUsersPage from './pages/AdminUsersPage'
import ChatPage from './pages/ChatPage'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SuperAdminDashboard from './pages/SuperAdminDashboard'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/superadmin"
          element={
            <ProtectedRoute role="superadmin">
              <AppLayout variant="superadmin">
                <SuperAdminDashboard />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute blockRoles={['superadmin']} redirectIfBlocked="/superadmin">
              <AppLayout fullBleed>
                <ChatPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/upload"
          element={
            <ProtectedRoute requireUpload blockRoles={['superadmin']} redirectIfBlocked="/superadmin">
              <AppLayout>
                <AdminUploadPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute role="admin" blockRoles={['superadmin']} redirectIfBlocked="/superadmin">
              <AppLayout>
                <AdminUsersPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/documents"
          element={
            <ProtectedRoute role="admin" blockRoles={['superadmin']} redirectIfBlocked="/superadmin">
              <AppLayout>
                <AdminDocumentsPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
