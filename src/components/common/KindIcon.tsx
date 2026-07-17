import { Calendar, FileText, MessagesSquare, MonitorCheck, Users, Video } from 'lucide-react'
import { KIND_STYLES } from '../../data/constants'
import type { EventKind } from '../../types'

const ICONS: Record<EventKind, typeof Users> = {
  ES: FileText,
  GD: MessagesSquare,
  動画選考: Video,
  面接: Users,
  Webテスト: MonitorCheck,
  その他: Calendar,
}

export default function KindIcon({ kind }: { kind: EventKind }) {
  const Icon = ICONS[kind]
  const s = KIND_STYLES[kind]
  return (
    <span
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
      style={{ color: s.fg, background: s.bg }}
    >
      <Icon size={17} strokeWidth={2} />
    </span>
  )
}
