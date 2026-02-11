import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import MainMatrix from './components/matrix/MainMatrix'
import ReportViewer from './components/reports/ReportViewer'
import ScheduleScreen from './components/schedule/ScheduleScreen'
import LoginPage from './components/auth/LoginPage'
import ModeSelectionScreen from './components/preparation/ModeSelectionScreen'
import PreparationMode from './components/preparation/PreparationMode'
import PreparationStep from './components/preparation/PreparationStep'
import { useAuthStore } from './store/authStore'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const checkAuth = useAuthStore((state) => state.checkAuth)

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return <>{children}</>
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <ModeSelectionScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/matrix"
          element={
            <ProtectedRoute>
              <MainMatrix />
            </ProtectedRoute>
          }
        />
        <Route
          path="/preparation"
          element={
            <ProtectedRoute>
              <PreparationMode />
            </ProtectedRoute>
          }
        >
          <Route path="step/:stepId" element={<PreparationStep />} />
        </Route>
        <Route
          path="/report/:reportId"
          element={
            <ProtectedRoute>
              <ReportViewer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/schedule"
          element={
            <ProtectedRoute>
              <ScheduleScreen />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App