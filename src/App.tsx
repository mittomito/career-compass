import { Navigate, Route, Routes } from 'react-router-dom'
import RequireAuth from './components/common/RequireAuth'
import AppLayout from './layouts/AppLayout'
import CalendarPage from './pages/CalendarPage'
import CompanyDetailPage from './pages/CompanyDetailPage'
import HomePage from './pages/HomePage'
import InternshipCalendarPage from './pages/InternshipCalendarPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import SignUpPage from './pages/SignUpPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/register-account" element={<SignUpPage />} />
      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route path="/home" element={<HomePage />} />
        <Route path="/companies/new" element={<RegisterPage />} />
        <Route path="/companies/:id" element={<CompanyDetailPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/internships" element={<InternshipCalendarPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}