import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import LoadingState from './components/common/LoadingState'
import RedirectIfAuthed from './components/common/RedirectIfAuthed'
import RequireAuth from './components/common/RequireAuth'
import LoginPage from './pages/LoginPage'
import PasswordResetPage from './pages/PasswordResetPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import SignUpPage from './pages/SignUpPage'
import TermsPage from './pages/TermsPage'

// ログイン後の画面はすべて遅延読み込みにする。
// これらは Firestore（firebase/firestore）に依存しており、静的に import すると
// ログイン画面の初回表示バンドルに Firestore まで含まれてしまうため
const AuthedShell = lazy(() => import('./layouts/AuthedShell'))
const HomePage = lazy(() => import('./pages/HomePage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const CompanyDetailPage = lazy(() => import('./pages/CompanyDetailPage'))
const CalendarPage = lazy(() => import('./pages/CalendarPage'))
const InternshipCalendarPage = lazy(() => import('./pages/InternshipCalendarPage'))
const InterviewPrepPage = lazy(() => import('./pages/InterviewPrepPage'))
const ObOgPrepPage = lazy(() => import('./pages/ObOgPrepPage'))
const AnalysisPage = lazy(() => import('./pages/AnalysisPage'))
const HelpPage = lazy(() => import('./pages/HelpPage'))
const AccountSettingsPage = lazy(() => import('./pages/AccountSettingsPage'))

export default function App() {
  return (
    <Suspense fallback={<LoadingState label="読み込み中…" />}>
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
        <Route path="/terms" element={<TermsPage />} />
        <Route
          element={
            <RequireAuth>
              <AuthedShell />
            </RequireAuth>
          }
        >
          <Route path="/home" element={<HomePage />} />
          <Route path="/companies/new" element={<RegisterPage />} />
          <Route path="/companies/:id" element={<CompanyDetailPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/internships" element={<InternshipCalendarPage />} />
          <Route path="/interview-prep" element={<InterviewPrepPage />} />
          <Route path="/ob-og-prep" element={<ObOgPrepPage />} />
          <Route path="/analysis" element={<AnalysisPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/account" element={<AccountSettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
