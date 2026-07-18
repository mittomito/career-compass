import { AlertTriangle, ChevronLeft } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useCompanies } from '../hooks/useCompanies'
import { deleteInterviewPrep } from '../hooks/useInterviewPrep'
import { Link } from 'react-router-dom'

function toJapaneseError(code: string): string {
  switch (code) {
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'パスワードが正しくありません。'
    case 'auth/too-many-requests':
      return '試行回数が多すぎます。しばらくしてから再度お試しください。'
    default:
      return '削除に失敗しました。時間をおいて再度お試しください。'
  }
}

export default function AccountSettingsPage() {
  const { user, reauthenticate, deleteAccount } = useAuth()
  const { removeAllCompanies, loading: companiesLoading } = useCompanies()
  const navigate = useNavigate()
  const [confirming, setConfirming] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleDelete = async () => {
    if (!password) {
      setError('確認のため、パスワードを入力してください。')
      return
    }
    if (companiesLoading) {
      setError('データを読み込み中です。しばらくしてからもう一度お試しください。')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      // 必ず本人確認を先に行う。データ削除後に再認証が失敗すると、
      // アカウントだけ残ってデータが消失するため、この順序を変えないこと
      await reauthenticate(password)
      await removeAllCompanies()
      if (user) await deleteInterviewPrep(user.uid)
      await deleteAccount()
      navigate('/')
    } catch (err) {
      const code = (err as { code?: string }).code ?? ''
      setError(toJapaneseError(code))
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 pb-20 pt-6 sm:px-6">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-ink-sub transition hover:text-brand"
      >
        <ChevronLeft size={16} />
        戻る
      </button>

      <h1 className="mb-1 text-xl font-extrabold">アカウント設定</h1>
      <p className="mb-6 text-sm text-ink-sub">{user?.email}</p>

      <div className="card border-danger/30 p-6">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-danger-soft text-danger">
            <AlertTriangle size={18} />
          </span>
          <div>
            <h2 className="text-base font-extrabold text-ink">アカウントを削除する</h2>
            <p className="mt-1 text-sm text-ink-sub">
              アカウントを削除すると、登録している全ての企業データ・ES・面接記録・企業研究メモ・面接対策テンプレートが完全に削除されます。この操作は取り消せません。
            </p>
          </div>
        </div>

        {!confirming ? (
          <button
            type="button"
            className="btn-ghost mt-5 border-danger text-danger hover:border-danger hover:bg-danger-soft"
            onClick={() => setConfirming(true)}
          >
            アカウントを削除する
          </button>
        ) : (
          <div className="mt-5 rounded-xl border border-danger/30 bg-danger-soft p-4">
            <label className="field-label">確認のため、パスワードを入力してください</label>
            <input
              type="password"
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className="mt-2 text-xs font-semibold text-danger">{error}</p>}
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                className="btn-ghost flex-1"
                onClick={() => {
                  setConfirming(false)
                  setPassword('')
                  setError('')
                }}
                disabled={submitting}
              >
                キャンセル
              </button>
              <button
                type="button"
                className="flex-1 rounded-xl bg-danger px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                onClick={handleDelete}
                disabled={submitting}
              >
                {submitting ? '削除中…' : '完全に削除する'}
              </button>
            </div>
          </div>
        )}
      </div>
      <p className="mt-6 flex justify-center gap-4 text-center text-xs text-ink-faint">
        <Link to="/terms" className="hover:underline">
          利用規約
        </Link>
        <Link to="/privacy" className="hover:underline">
          プライバシーポリシー
        </Link>
      </p>
    </div>
  )
}