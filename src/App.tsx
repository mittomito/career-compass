import { Navigate, Route, Routes } from 'react-router-dom'
import RedirectIfAuthed from './components/common/RedirectIfAuthed'
import RequireAuth from './components/common/RequireAuth'
import AppLayout from './layouts/AppLayout'
import CalendarPage from './pages/CalendarPage'
import CompanyDetailPage from './pages/CompanyDetailPage'
import HomePage from './pages/HomePage'
import InternshipCalendarPage from './pages/InternshipCalendarPage'
import LoginPage from './pages/LoginPage'
import PasswordResetPage from './pages/PasswordResetPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import RegisterPage from './pages/RegisterPage'
import SignUpPage from './pages/SignUpPage'
import AccountSettingsPage from './pages/AccountSettingsPage'

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <RedirectIfAuthed>
            <LoginPage />
          </RedirectIfAuthed>
        }
      />
      <Route
        path="/register-account"
        element={
          <RedirectIfAuthed>
            <SignUpPage />
          </RedirectIfAuthed>
        }
      />
      <Route path="/reset-password" element={<PasswordResetPage />} />
      <Route path="/privacy" element={<PrivacyPolicyPage />} />
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
        <Route path="/account" element={<AccountSettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}