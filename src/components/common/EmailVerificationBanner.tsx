import { MailWarning, X } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'

const DISMISS_KEY = 'email-verification-banner-dismissed'

/**
 * メールアドレス未確認のユーザーへの案内バナー。
 * 機能の利用は妨げず、確認メールの再送だけできるようにする。
 * 閉じてもこのセッション中だけ非表示（次回アクセス時にはまた出る）。
 */
export default function EmailVerificationBanner() {
  const { user, resendVerification } = useAuth()
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem(DISMISS_KEY) === '1')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle')

  if (!user || user.emailVerified || dismissed) return null

  const resend = async () => {
    setStatus('sending')
    try {
      await resendVerification()
      setStatus('sent')
    } catch (err) {
      // 連続送信は auth/too-many-requests になるため、失敗として案内する
      console.error('確認メールの再送に失敗しました', err)
      setStatus('failed')
    }
  }

  const dismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, '1')
    setDismissed(true)
  }

  return (
    <div className="border-b border-line bg-warn-soft">
      <div className="mx-auto flex max-w-5xl items-center gap-2.5 px-4 py-2 text-[13px] text-warn sm:px-6">
        <MailWarning size={15} className="shrink-0" />
        <p className="min-w-0 flex-1 font-semibold">
          メールアドレスの確認が完了していません。{user.email} 宛の確認メールのリンクを開いてください（確認後に再読み込みするとこの表示は消えます）。
        </p>
        {status === 'sent' ? (
          <span className="shrink-0 font-bold">送信しました</span>
        ) : (
          <button
            type="button"
            className="shrink-0 font-bold underline hover:opacity-80 disabled:opacity-50"
            onClick={resend}
            disabled={status === 'sending'}
          >
            {status === 'sending' ? '送信中…' : status === 'failed' ? '再送に失敗（もう一度）' : '確認メールを再送'}
          </button>
        )}
        <button
          type="button"
          className="shrink-0 rounded p-0.5 hover:opacity-70"
          onClick={dismiss}
          aria-label="この案内を閉じる"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
