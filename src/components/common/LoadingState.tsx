import { Loader2 } from 'lucide-react'

export default function LoadingState({ label = '読み込み中…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20">
      <Loader2 size={28} className="animate-spin text-brand" />
      <p className="text-sm text-ink-faint">{label}</p>
    </div>
  )
}