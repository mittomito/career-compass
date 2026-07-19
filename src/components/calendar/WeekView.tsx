import { MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { KIND_STYLES } from '../../data/constants'
import { DOW, fmtTime, sameDay, startOfToday } from '../../utils/date'
import type { CalendarEvent } from '../../utils/events'

interface Props {
  /** 週の先頭（日曜日） */
  start: Date
  events: CalendarEvent[]
  /** 日付見出しをタップしたとき（日表示への切り替えに使う） */
  onSelectDay: (d: Date) => void
}

function weekDays(start: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
}

/** 週表示のイベントカード。月表示では省略している時刻・場所・メモまで表示する */
function EventCard({ e }: { e: CalendarEvent }) {
  const s = KIND_STYLES[e.kind]
  return (
    <Link
      to={`/companies/${e.companyId}?tab=selection`}
      className="block rounded-lg border border-line bg-white p-2 transition hover:border-brand hover:shadow-card"
      style={{ borderLeft: `3px solid ${s.main}` }}
    >
      <p className="text-[11px] font-bold" style={{ color: s.fg }}>
        {fmtTime(e.date.toISOString())} {e.label}
      </p>
      <p className="truncate text-xs font-bold text-ink" title={e.companyName}>
        {e.companyName}
      </p>
      {e.place && (
        <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-ink-sub">
          <MapPin size={10} className="shrink-0" />
          {e.place}
        </p>
      )}
      {e.memo && (
        <p className="mt-0.5 line-clamp-2 break-words text-[11px] text-ink-faint">{e.memo}</p>
      )}
    </Link>
  )
}

export default function WeekView({ start, events, onSelectDay }: Props) {
  const today = startOfToday()
  const days = weekDays(start)

  const dayHeader = (d: Date, i: number) => {
    const isToday = sameDay(d, today)
    return (
      <button
        type="button"
        className="flex w-full items-center justify-center gap-1.5 py-2 transition hover:bg-brand-ghost"
        onClick={() => onSelectDay(d)}
        title="日表示で見る"
      >
        <span
          className={`text-xs font-semibold ${
            i === 0 ? 'text-danger' : i === 6 ? 'text-brand' : 'text-ink-sub'
          }`}
        >
          {DOW[d.getDay()]}
        </span>
        <span
          className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
            isToday ? 'bg-brand text-white' : 'text-ink'
          }`}
        >
          {d.getDate()}
        </span>
      </button>
    )
  }

  return (
    <>
      {/* デスクトップ：7列のカラム表示 */}
      <div className="card hidden overflow-hidden md:block">
        <div className="grid grid-cols-7 border-b border-line bg-brand-ghost">
          {days.map((d, i) => (
            <div key={i}>{dayHeader(d, i)}</div>
          ))}
        </div>
        <div className="grid min-h-[320px] grid-cols-7">
          {days.map((d, i) => {
            const dayEvents = events.filter((e) => sameDay(e.date, d))
            return (
              <div
                key={i}
                className={`flex flex-col gap-1.5 border-r border-line p-1.5 last:border-r-0 ${
                  sameDay(d, today) ? 'bg-brand-ghost/60' : 'bg-white'
                }`}
              >
                {dayEvents.map((e) => (
                  <EventCard key={e.id} e={e} />
                ))}
              </div>
            )
          })}
        </div>
      </div>

      {/* モバイル：日ごとの縦積みリスト */}
      <div className="flex flex-col gap-2.5 md:hidden">
        {days.map((d, i) => {
          const dayEvents = events.filter((e) => sameDay(e.date, d))
          return (
            <div key={i} className="card overflow-hidden">
              <div className="border-b border-line bg-brand-ghost">{dayHeader(d, i)}</div>
              <div className="flex flex-col gap-1.5 p-2">
                {dayEvents.length === 0 ? (
                  <p className="px-1 py-0.5 text-xs text-ink-faint">予定なし</p>
                ) : (
                  dayEvents.map((e) => <EventCard key={e.id} e={e} />)
                )}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
