import { ExternalLink, MapPin, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { KIND_STYLES } from '../../data/constants'
import { DOW, fmtTime, sameDay } from '../../utils/date'
import type { CalendarEvent } from '../../utils/events'
import { safeExternalHref } from '../../utils/url'
import EmptyState from '../common/EmptyState'
import KindIcon from '../common/KindIcon'

interface Props {
  date: Date
  events: CalendarEvent[]
  onAdd: () => void
}

/**
 * 日表示。選んだ1日の予定を、月表示では省略している
 * 時刻・場所・URL・メモまで含めて一覧する。
 */
export default function DayView({ date, events, onAdd }: Props) {
  const dayEvents = events.filter((e) => sameDay(e.date, date))

  return (
    <div className="card p-5">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <h2 className="text-sm font-bold text-ink">
          {date.getMonth() + 1}月{date.getDate()}日（{DOW[date.getDay()]}）の予定
        </h2>
        <span className="rounded-full bg-brand-soft px-2.5 py-px text-xs font-bold text-brand">
          {dayEvents.length}
        </span>
        <button type="button" className="btn-text ml-auto" onClick={onAdd}>
          <Plus size={14} strokeWidth={2.6} />
          予定を追加
        </button>
      </div>

      {dayEvents.length === 0 ? (
        <EmptyState
          title="予定はありません"
          description="「予定を追加」から、この日の予定を登録できます。"
        />
      ) : (
        <ul className="flex flex-col gap-2.5">
          {dayEvents.map((e) => {
            const s = KIND_STYLES[e.kind]
            const href = e.url ? safeExternalHref(e.url) : undefined
            return (
              <li
                key={e.id}
                className="rounded-xl border border-line p-4"
                style={{ borderLeft: `4px solid ${s.main}` }}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <KindIcon kind={e.kind} />
                  <Link
                    to={`/companies/${e.companyId}?tab=selection`}
                    className="text-sm font-bold text-ink hover:text-brand hover:underline"
                  >
                    {e.companyName}
                  </Link>
                  <span
                    className="rounded-full px-2 py-px text-xs font-bold"
                    style={{ color: s.fg, background: s.bg }}
                  >
                    {e.label}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-sub">
                  <span className="font-semibold text-ink">{fmtTime(e.date.toISOString())}</span>
                  {e.place && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={12} />
                      {e.place}
                    </span>
                  )}
                  {href && (
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-brand hover:underline"
                    >
                      <ExternalLink size={12} />
                      リンクを開く
                    </a>
                  )}
                </div>
                {e.memo && (
                  <p className="mt-2 whitespace-pre-wrap break-words rounded-lg bg-brand-ghost px-2.5 py-1.5 text-xs text-ink-sub">
                    {e.memo}
                  </p>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
