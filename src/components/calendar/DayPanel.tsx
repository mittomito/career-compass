import { MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import KindIcon from '../common/KindIcon'
import EmptyState from '../common/EmptyState'
import { KIND_STYLES } from '../../data/constants'
import { DOW, fmtTime, sameDay } from '../../utils/date'
import type { CalendarEvent } from '../../utils/events'

interface Props {
  date: Date
  events: CalendarEvent[]
}

export default function DayPanel({ date, events }: Props) {
  const dayEvents = events.filter((e) => sameDay(e.date, date))

  return (
    <aside className="card p-5 lg:sticky lg:top-[76px] lg:self-start">
      <h2 className="text-sm font-bold text-ink">
        {date.getMonth() + 1}月{date.getDate()}日（{DOW[date.getDay()]}）の予定
      </h2>

      {dayEvents.length === 0 ? (
        <div className="mt-4">
          <EmptyState title="予定はありません" description="日付を選んで予定を確認できます。" />
        </div>
      ) : (
        <ul className="mt-4 flex flex-col gap-2.5">
          {dayEvents.map((e) => {
            const s = KIND_STYLES[e.kind]
            return (
              <li key={e.id}>
                <Link
                  to={`/companies/${e.companyId}?tab=selection`}
                  className="block rounded-xl border border-line p-3 transition hover:border-brand hover:shadow-card"
                  style={{ borderLeft: `4px solid ${s.main}` }}
                >
                  <div className="flex items-center gap-2">
                    <KindIcon kind={e.kind} />
                    <span className="text-sm font-bold text-ink">{e.companyName}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-ink-sub">
                    <span>{e.label}</span>
                    <span className="font-semibold text-ink">{fmtTime(e.date.toISOString())}</span>
                    {e.place && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={12} />
                        {e.place}
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </aside>
  )
}