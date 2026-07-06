import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import BrandMark from '../components/common/BrandMark'
import { useAuth } from '../hooks/useAuth'

function toJapaneseError(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'このメールアドレスは既に登録されています。'
    case 'auth/invalid-email':
      return 'メールアドレスの形式が正しくありません。'
    case 'auth/weak-password':
      return 'パスワードは6文字以上で入力してください。'
    default:
      return '登録に失敗しました。時間をおいて再度お試しください。'
  }
}

export default function SignUpPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = async () => {
    setError('')
    if (!email.trim() || !password) {
      setError('メールアドレスとパスワードを入力してください。')
      return
    }
    if (password.length < 6) {
      setError('パスワードは6文字以上で入力してください。')
      return
    }
    if (password !== passwordConfirm) {
      setError('パスワードが一致しません。')
      return
    }
    setSubmitting(true)
    try {
      await register(email.trim(), password)
      navigate('/home')
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
        <p className="mb-8 text-center text-[13px] text-ink-faint">新規アカウントを作成します</p>

        <div className="mb-4">
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
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="field-label">
            パスワード（6文字以上）
          </label>
          <input
            id="password"
            type="password"
            className="input"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="mb-2">
          <label htmlFor="password-confirm" className="field-label">
            パスワード（確認）
          </label>
          <input
            id="password-confirm"
            type="password"
            className="input"
            placeholder="••••••••"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
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
          {submitting ? '登録中…' : '新規登録'}
        </button>

        <p className="mt-5 text-center text-sm text-ink-sub">
          既にアカウントをお持ちの方は{' '}
          <Link to="/" className="font-bold text-brand hover:underline">
            ログイン
          </Link>
        </p>
      </div>
    </div>
  )
}