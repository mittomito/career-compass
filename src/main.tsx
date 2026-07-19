import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import ErrorBoundary from './components/common/ErrorBoundary'
import { AuthProvider } from './hooks/useAuth'
import './index.css'

// CompaniesProvider（Firestore 購読）はログイン後の画面の入口（AuthedShell）に
// 移動している。ここに置くと Firestore がログイン画面のバンドルに含まれてしまうため
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
)