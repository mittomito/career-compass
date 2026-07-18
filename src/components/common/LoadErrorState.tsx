import { CloudOff, RotateCw } from 'lucide-react'

/**
 * Firestore の読み込み（購読）が失敗したときの案内。
 * 「データが0件」の画面と見分けがつくよう、消えたのではなく読めていないことを明示し、
 * 再試行の導線を出す。
 */
export default function LoadErrorState({
  title = 'データの読み込みに失敗しました',
  onRetry,
}: {
  title?: string
  onRetry: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-danger-soft text-danger">
        <CloudOff size={22} />
      </span>
      <p className="text-base font-bold text-ink">{title}</p>
      <p className="text-sm leading-relaxed text-ink-faint">
        データが消えたわけではありません。通信環境をご確認の上、再試行してください。
        <br />
        解決しない場合は、時間をおいてからもう一度アクセスしてください。
      </p>
      <button type="button" className="btn-primary mt-2" onClick={onRetry}>
        <RotateCw size={15} strokeWidth={2.4} />
        再試行
      </button>
    </div>
  )
}
