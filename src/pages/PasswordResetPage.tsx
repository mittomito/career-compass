import { useState } from 'react'
import { Link } from 'react-router-dom'
import BrandMark from '../components/common/BrandMark'
import { useAuth } from '../hooks/useAuth'

function toJapaneseError(code: string): string {
  switch (code) {
    case 'auth/invalid-email':
      return 'メールアドレスの形式が正しくありません。'
    case 'auth/too-many-requests':
      return '試行回数が多すぎます。しばらくしてから再度お試しください。'
    default:
      return '送信に失敗しました。時間をおいて再度お試しください。'
  }
}

export default function PasswordResetPage() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const submit = async () => {
    setError('')
    if (!email.trim()) {
      setError('メールアドレスを入力してください。')
      return
    }
    setSubmitting(true)
    try {
      await resetPassword(email.trim())
      // セキュリティ上の理由により、登録の有無に関わらず同じ成功表示にする
      setSent(true)
    } catch (err) {
      const code = (err as { code?: string }).code ?? ''
      setError(toJapaneseError(code))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center px-5"
      style={{
        background:
          'radial-gradient(900px 500px at 85% -10%, #DCE8FF 0%, transparent 60%), radial-gradient(700px 500px at -10% 100%, #E8F0FF 0%, transparent 55%), #F4F7FB',
      }}
    >
      <div className="w-[400px] max-w-full rounded-[20px] border border-line bg-white px-10 pb-9 pt-11 shadow-lift">
        <div className="mb-1.5 flex items-center justify-center gap-2.5">
          <BrandMark />
          <h1 className="text-[22px] font-extrabold tracking-wide">Career Compass</h1>
        </div>

        {sent ? (
          <>
            <p className="mb-2 text-center text-sm font-bold text-ink">送信しました</p>
            <p className="mb-8 text-center text-[13px] text-ink-faint">
              入力したメールアドレス宛てに、パスワード再設定用のリンクを送信しました。メールが届かない場合は、迷惑メールフォルダもご確認ください。
            </p>
            <Link to="/" className="btn-primary flex w-full justify-center rounded-xl py-3 text-base">
              ログイン画面へ戻る
            </Link>
          </>
        ) : (
          <>
            <p className="mb-8 text-center text-[13px] text-ink-faint">
              登録したメールアドレスを入力してください。パスワード再設定用のリンクをお送りします。
            </p>
            <div className="mb-2">
              <label htmlFor="email" className="field-label">
                メールアドレス
              </label>
              <input
                id="email"
                type="email"
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submit()}
              />
            </div>

            {error && <p className="mb-3 text-xs font-semibold text-danger">{error}</p>}

            <button
              type="button"
              className="btn-primary mt-3 w-full rounded-xl py-3 text-base disabled:opacity-60"
              onClick={submit}
              disabled={submitting}
            >
              {submitting ? '送信中…' : '再設定メールを送信'}
            </button>

            <p className="mt-5 text-center text-sm text-ink-sub">
              <Link to="/" className="font-bold text-brand hover:underline">
                ログイン画面へ戻る
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}