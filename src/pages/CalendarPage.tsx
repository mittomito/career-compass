import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import { useMemo, useState } from 'react'
import DayPanel from '../components/calendar/DayPanel'
import MonthGrid from '../components/calendar/MonthGrid'
import { KIND_STYLES } from '../data/constants'
import { useCompanies } from '../hooks/useCompanies'
import type { EventKind } from '../types'
import { startOfToday } from '../utils/date'
import { buildEvents } from '../utils/events'

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

const LEGEND: EventKind[] = ['ES', 'GD', '動画選考', '面接', 'Webテスト', 'その他']

export default function CalendarPage() {
  const { companies } = useCompanies()
  const today = startOfToday()
  const [month, setMonth] = useState<Date>(startOfMonth(today))
  const [selected, setSelected] = useState<Date>(today)

  const events = useMemo(() => buildEvents(companies), [companies])

  const goPrevMonth = () => setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))
  const goNextMonth = () => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))
  const goToday = () => {
    setMonth(startOfMonth(today))
    setSelected(today)
  }

  const isCurrentMonth = month.getFullYear() === today.getFullYear() && month.getMonth() === today.getMonth()

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <h1 className="text-lg font-extrabold tracking-tight sm:text-xl">カレンダー</h1>
        <div className="ml-auto flex items-center gap-2">
          <button type="button" className="icon-btn" onClick={goPrevMonth} aria-label="前の月">
            <ChevronLeft size={16} />
          </button>
          <p className="w-[100px] text-center text-sm font-extrabold sm:w-[110px] sm:text-[15px]">
            {month.getFullYear()}年{month.getMonth() + 1}月
          </p>
          <button type="button" className="icon-btn" onClick={goNextMonth} aria-label="次の月">
            <ChevronRight size={16} />
          </button>
          <button type="button" className="btn-ghost" onClick={goToday} disabled={isCurrentMonth}>
            <RotateCcw size={14} strokeWidth={2.4} />
            <span className="hidden sm:inline">今月</span>
          </button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-4">
        {LEGEND.map((kind) => (
          <span key={kind} className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-sub">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: KIND_STYLES[kind].main }} />
            {kind}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_300px]">
        <MonthGrid month={month} events={events} selected={selected} onSelect={setSelected} />
        <DayPanel date={selected} events={events} />
      </div>
    </div>
  )
}