import { ChevronLeft, ChevronRight, Plus, RotateCcw } from 'lucide-react'
import { useMemo, useState } from 'react'
import AddScheduleDialog from '../components/calendar/AddScheduleDialog'
import DayPanel from '../components/calendar/DayPanel'
import DayView from '../components/calendar/DayView'
import MonthGrid from '../components/calendar/MonthGrid'
import WeekView from '../components/calendar/WeekView'
import { KIND_STYLES } from '../data/constants'
import { useCompanies } from '../hooks/useCompanies'
import type { EventKind } from '../types'
import { DOW, sameDay, startOfToday } from '../utils/date'
import { buildEvents } from '../utils/events'

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

/** その日を含む週の先頭（日曜日） */
function startOfWeek(d: Date): Date {
  const s = new Date(d)
  s.setDate(d.getDate() - d.getDay())
  return s
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d)
  x.setDate(d.getDate() + n)
  return x
}

const LEGEND: EventKind[] = ['ES', 'GD', '動画選考', '面接', 'Webテスト', 'その他']

type ViewMode = 'month' | 'week' | 'day'

const VIEW_TABS: { value: ViewMode; label: string }[] = [
  { value: 'month', label: '月' },
  { value: 'week', label: '週' },
  { value: 'day', label: '日' },
]

export default function CalendarPage() {
  const { companies } = useCompanies()
  const today = startOfToday()
  const [view, setView] = useState<ViewMode>('month')
  const [month, setMonth] = useState<Date>(startOfMonth(today))
  const [selected, setSelected] = useState<Date>(today)
  const [addOpen, setAddOpen] = useState(false)

  const events = useMemo(() => buildEvents(companies), [companies])

  // 週・日表示では selected を動かし、月表示に戻ったとき同じ月が出るよう month も追従させる
  const moveSelected = (days: number) => {
    const next = addDays(selected, days)
    setSelected(next)
    setMonth(startOfMonth(next))
  }
  const goPrev = () => {
    if (view === 'month') setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))
    else moveSelected(view === 'week' ? -7 : -1)
  }
  const goNext = () => {
    if (view === 'month') setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))
    else moveSelected(view === 'week' ? 7 : 1)
  }
  const goToday = () => {
    setMonth(startOfMonth(today))
    setSelected(today)
  }

  const weekStart = startOfWeek(selected)
  const weekEnd = addDays(weekStart, 6)

  const title =
    view === 'month'
      ? `${month.getFullYear()}年${month.getMonth() + 1}月`
      : view === 'week'
        ? `${weekStart.getMonth() + 1}/${weekStart.getDate()}〜${weekEnd.getMonth() + 1}/${weekEnd.getDate()}`
        : `${selected.getMonth() + 1}月${selected.getDate()}日（${DOW[selected.getDay()]}）`

  const atToday =
    view === 'month'
      ? month.getFullYear() === today.getFullYear() && month.getMonth() === today.getMonth()
      : sameDay(selected, today) ||
        (view === 'week' && sameDay(startOfWeek(selected), startOfWeek(today)))

  const stepLabel = view === 'month' ? '月' : view === 'week' ? '週' : '日'

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h1 className="text-lg font-extrabold tracking-tight sm:text-xl">カレンダー</h1>
        <div className="ml-auto flex items-center gap-2">
          <button type="button" className="icon-btn" onClick={goPrev} aria-label={`前の${stepLabel}`}>
            <ChevronLeft size={16} />
          </button>
          <p className="w-[100px] text-center text-sm font-extrabold sm:w-[110px] sm:text-[15px]">
            {title}
          </p>
          <button type="button" className="icon-btn" onClick={goNext} aria-label={`次の${stepLabel}`}>
            <ChevronRight size={16} />
          </button>
          <button type="button" className="btn-ghost" onClick={goToday} disabled={atToday}>
            <RotateCcw size={14} strokeWidth={2.4} />
            <span className="hidden sm:inline">{view === 'month' ? '今月' : '今日'}</span>
          </button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        {/* 月・週・日の表示切り替え */}
        <div className="flex gap-1 rounded-xl border border-line bg-white p-1">
          {VIEW_TABS.map((t) => (
            <button
              key={t.value}
              type="button"
              className={`rounded-lg px-4 py-1 text-sm font-semibold transition ${
                view === t.value ? 'bg-brand text-white' : 'text-ink-sub hover:text-ink'
              }`}
              onClick={() => setView(t.value)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button type="button" className="btn-primary ml-auto" onClick={() => setAddOpen(true)}>
          <Plus size={15} strokeWidth={2.6} />
          予定を追加
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-4">
        {LEGEND.map((kind) => (
          <span key={kind} className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-sub">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: KIND_STYLES[kind].main }} />
            {kind}
          </span>
        ))}
      </div>

      {view === 'month' && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_300px]">
          <MonthGrid month={month} events={events} selected={selected} onSelect={setSelected} />
          <DayPanel date={selected} events={events} onAdd={() => setAddOpen(true)} />
        </div>
      )}
      {view === 'week' && (
        <WeekView
          start={weekStart}
          events={events}
          onSelectDay={(d) => {
            setSelected(d)
            setMonth(startOfMonth(d))
            setView('day')
          }}
        />
      )}
      {view === 'day' && <DayView date={selected} events={events} onAdd={() => setAddOpen(true)} />}

      {addOpen && <AddScheduleDialog date={selected} onClose={() => setAddOpen(false)} />}
    </div>
  )
}
