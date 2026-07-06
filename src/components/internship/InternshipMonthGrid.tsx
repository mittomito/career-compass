import { useMemo } from 'react'
import { DOW, sameDay, startOfToday } from '../../utils/date'
import type { InternshipBar } from '../../utils/internships'

interface Props {
  month: Date
  bars: InternshipBar[]
  colorOf: (companyId: string) => string
  selected: Date
  onSelect: (d: Date) => void
}

function buildWeeks(month: Date): Date[][] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1)
  const start = new Date(first)
  start.setDate(first.getDate() - first.getDay())
  const days = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
  const weeks: Date[][] = []
  for (let i = 0; i < 6; i++) weeks.push(days.slice(i * 7, i * 7 + 7))
  return weeks
}

function atMidnight(d: Date): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

interface WeekBar {
  bar: InternshipBar
  startCol: number
  span: number
  isStart: boolean
  isEnd: boolean
}

/** 週内に収まる範囲へ期間をクリップし、グリッド列（0〜6）に変換する */
function barsForWeek(week: Date[], bars: InternshipBar[]): WeekBar[] {
  const weekStart = atMidnight(week[0])
  const weekEnd = atMidnight(week[6])
  const result: WeekBar[] = []
  for (const b of bars) {
    const bs = atMidnight(b.start)
    const be = atMidnight(b.end)
    if (be.getTime() < weekStart.getTime() || bs.getTime() > weekEnd.getTime()) continue
    const clippedStart = bs.getTime() < weekStart.getTime() ? weekStart : bs
    const clippedEnd = be.getTime() > weekEnd.getTime() ? weekEnd : be
    const startCol = Math.round((clippedStart.getTime() - weekStart.getTime()) / 86400000)
    const endCol = Math.round((clippedEnd.getTime() - weekStart.getTime()) / 86400000)
    result.push({
      bar: b,
      startCol,
      span: endCol - startCol + 1,
      isStart: bs.getTime() === clippedStart.getTime(),
      isEnd: be.getTime() === clippedEnd.getTime(),
    })
  }
  return result.sort((a, b) => a.bar.start.getTime() - b.bar.start.getTime())
}

/** 指定日にアクティブなバー（インターン期間）一覧 */
function barsForDay(d: Date, bars: InternshipBar[]): InternshipBar[] {
  const day = atMidnight(d).getTime()
  return bars.filter((b) => atMidnight(b.start).getTime() <= day && day <= atMidnight(b.end).getTime())
}

/** インターン期間を横棒バーで表示する月間カレンダー（md未満は色ドット表示） */
export default function InternshipMonthGrid({ month, bars, colorOf, selected, onSelect }: Props) {
  const weeks = useMemo(() => buildWeeks(month), [month])
  const today = startOfToday()

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

      {weeks.map((week, wi) => {
        const weekBars = barsForWeek(week, bars)
        return (
          <div key={wi} className="border-b border-line last:border-b-0">
            {/* モバイル: 日付+色ドット */}
            <div className="grid grid-cols-7">
              {week.map((d, di) => {
                const inMonth = d.getMonth() === month.getMonth()
                const isToday = sameDay(d, today)
                const isSelected = sameDay(d, selected)
                const dayBars = barsForDay(d, bars)
                const overlapping = dayBars.length > 1
                return (
                  <button
                    key={di}
                    type="button"
                    onClick={() => onSelect(d)}
                    className={`flex min-h-[52px] flex-col items-stretch gap-1 border-r border-line p-1 text-left transition last:border-r-0 md:hidden ${
                      inMonth ? 'bg-white' : 'bg-paper'
                    } ${isSelected ? 'ring-2 ring-inset ring-brand' : 'hover:bg-brand-ghost'}`}
                  >
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                        isToday
                          ? 'bg-brand text-white'
                          : inMonth
                            ? di === 0
                              ? 'text-danger'
                              : di === 6
                                ? 'text-brand'
                                : 'text-ink'
                            : 'text-ink-faint'
                      } ${overlapping ? 'ring-2 ring-danger' : ''}`}
                    >
                      {d.getDate()}
                    </span>
                    <span className="flex flex-wrap gap-0.5">
                      {dayBars.slice(0, 4).map((b) => (
                        <span
                          key={b.id}
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ background: colorOf(b.companyId) }}
                        />
                      ))}
                      {dayBars.length > 4 && (
                        <span className="text-[9px] font-medium text-ink-faint">+{dayBars.length - 4}</span>
                      )}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* md以上: 日付行 */}
            <div className="hidden grid-cols-7 md:grid">
              {week.map((d, di) => {
                const inMonth = d.getMonth() === month.getMonth()
                const isToday = sameDay(d, today)
                const isSelected = sameDay(d, selected)
                return (
                  <button
                    key={di}
                    type="button"
                    onClick={() => onSelect(d)}
                    className={`border-r border-line px-1.5 pt-1.5 text-left transition last:border-r-0 ${
                      inMonth ? 'bg-white' : 'bg-paper'
                    } ${isSelected ? 'ring-2 ring-inset ring-brand' : 'hover:bg-brand-ghost'}`}
                  >
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                        isToday
                          ? 'bg-brand text-white'
                          : inMonth
                            ? di === 0
                              ? 'text-danger'
                              : di === 6
                                ? 'text-brand'
                                : 'text-ink'
                            : 'text-ink-faint'
                      }`}
                    >
                      {d.getDate()}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* md以上: 期間バー */}
            <div className="hidden flex-col gap-1 px-1.5 pb-2 pt-1 md:flex">
              {weekBars.map(({ bar, startCol, span, isStart, isEnd }) => {
                const overlapped = weekBars.some(
                  (wb) =>
                    wb.bar.id !== bar.id &&
                    startCol < wb.startCol + wb.span &&
                    wb.startCol < startCol + span,
                )
                return (
                  <div
                    key={bar.id}
                    className="grid grid-cols-7"
                    title={`${bar.companyName}${bar.label ? `（${bar.label}）` : ''}`}
                  >
                    <div
                      className={`truncate px-2 py-1 text-[11px] font-bold text-white ${
                        isStart ? 'rounded-l-md' : ''
                      } ${isEnd ? 'rounded-r-md' : ''} ${overlapped ? 'ring-2 ring-danger' : ''}`}
                      style={{
                        gridColumnStart: startCol + 1,
                        gridColumnEnd: startCol + 1 + span,
                        background: colorOf(bar.companyId),
                      }}
                    >
                      {isStart ? bar.companyName : ''}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}