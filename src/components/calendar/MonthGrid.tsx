import type { CalendarEvent } from '../../utils/events'
import { DOW, sameDay, startOfToday } from '../../utils/date'
import { KIND_STYLES } from '../../data/constants'

interface Props {
  month: Date
  events: CalendarEvent[]
  selected: Date
  onSelect: (d: Date) => void
}

function buildCells(month: Date): Date[] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1)
  const start = new Date(first)
  start.setDate(first.getDate() - first.getDay())
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
}

export default function MonthGrid({ month, events, selected, onSelect }: Props) {
  const today = startOfToday()
  const cells = buildCells(month)

  return (
    <div className="card overflow-hidden">
      <div className="grid grid-cols-7 border-b border-line bg-brand-ghost">
        {DOW.map((d, i) => (
          <div
            key={d}
            className={`py-2 text-center text-xs font-semibold ${
              i === 0 ? 'text-danger' : i === 6 ? 'text-brand' : 'text-ink-sub'
            }`}
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {cells.map((d, i) => {
          const inMonth = d.getMonth() === month.getMonth()
          const isToday = sameDay(d, today)
          const isSelected = sameDay(d, selected)
          const dayEvents = events.filter((e) => sameDay(e.date, d))

          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelect(d)}
              className={`flex min-h-[56px] flex-col items-stretch gap-1 border-b border-r border-line p-1.5 text-left align-top transition last:border-r-0 md:min-h-[92px] ${
                inMonth ? 'bg-white' : 'bg-paper'
              } ${isSelected ? 'ring-2 ring-inset ring-brand' : 'hover:bg-brand-ghost'}`}
            >
              <span
                className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                  isToday
                    ? 'bg-brand text-white'
                    : inMonth
                      ? d.getDay() === 0
                        ? 'text-danger'
                        : d.getDay() === 6
                          ? 'text-brand'
                          : 'text-ink'
                      : 'text-ink-faint'
                }`}
              >
                {d.getDate()}
              </span>

              {/* モバイル：色ドットのみ */}
              <span className="flex flex-wrap gap-1 md:hidden">
                {dayEvents.slice(0, 5).map((e) => (
                  <span
                    key={e.id}
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: KIND_STYLES[e.kind].main }}
                    title={`${e.companyName} / ${e.label}`}
                  />
                ))}
                {dayEvents.length > 5 && (
                  <span className="text-[9px] font-bold text-ink-faint">+{dayEvents.length - 5}</span>
                )}
              </span>

              {/* デスクトップ：企業名チップ */}
              <span className="hidden flex-col gap-0.5 md:flex">
                {dayEvents.slice(0, 3).map((e) => {
                  const s = KIND_STYLES[e.kind]
                  return (
                    <span
                      key={e.id}
                      className="truncate rounded px-1 py-0.5 text-[10px] font-medium leading-tight"
                      style={{ background: s.bg, color: s.fg }}
                      title={`${e.companyName} / ${e.label}`}
                    >
                      {e.companyName}
                    </span>
                  )
                })}
                {dayEvents.length > 3 && (
                  <span className="px-1 text-[10px] font-medium text-ink-faint">
                    +{dayEvents.length - 3}件
                  </span>
                )}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}