import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

/** ログイン済みのユーザーをホームへ送る。ログイン画面・新規登録画面用 */
export default function RedirectIfAuthed({ children }: { children: ReactNode }) {
  const { user } = useAuth()

  if (user) {
    return <Navigate to="/home" replace />
  }

  // 認証状態の確認中はフォームをそのまま表示する（未ログインの利用者を待たせない）
  return <>{children}</>
}
