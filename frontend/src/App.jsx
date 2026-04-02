import { Navigate, Route, Routes } from 'react-router-dom'
import { BrowserRouter } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './layout/AppLayout'
import AdminDocumentsPage from './pages/AdminDocumentsPage'
import AdminUploadPage from './pages/AdminUploadPage'
import AdminUsersPage from './pages/AdminUsersPage'
import ChatPage from './pages/ChatPage'
import LoginPage from './pages/LoginPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <AppLayout fullBleed>
                <ChatPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/upload"
          element={
            <ProtectedRoute requireUpload>
              <AppLayout>
                <AdminUploadPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute role="admin">
              <AppLayout>
                <AdminUsersPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/documents"
          element={
            <ProtectedRoute role="admin">
              <AppLayout>
                <AdminDocumentsPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/chat" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
