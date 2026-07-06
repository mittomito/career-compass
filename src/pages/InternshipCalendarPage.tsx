import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import { useMemo, useState } from 'react'
import InternshipDayPanel from '../components/internship/InternshipDayPanel'
import InternshipMonthGrid from '../components/internship/InternshipMonthGrid'
import { INTERNSHIP_PALETTE } from '../data/constants'
import { useCompanies } from '../hooks/useCompanies'
import { startOfToday } from '../utils/date'
import { buildInternshipBars } from '../utils/internships'

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

export default function InternshipCalendarPage() {
  const { companies } = useCompanies()
  const today = startOfToday()
  const [month, setMonth] = useState<Date>(startOfMonth(today))
  const [selected, setSelected] = useState<Date>(today)

  const internCompanies = useMemo(() => companies.filter((c) => c.type === 'インターン'), [companies])

  const colorMap = useMemo(() => {
    const map = new Map<string, string>()
    internCompanies.forEach((c, i) => map.set(c.id, INTERNSHIP_PALETTE[i % INTERNSHIP_PALETTE.length]))
    return map
  }, [internCompanies])

  const bars = useMemo(() => buildInternshipBars(companies), [companies])
  const colorOf = (id: string) => colorMap.get(id) ?? '#8896AC'

  const goPrevMonth = () => setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))
  const goNextMonth = () => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))
  const goToday = () => {
    setMonth(startOfMonth(today))
    setSelected(today)
  }
  const isCurrentMonth = month.getFullYear() === today.getFullYear() && month.getMonth() === today.getMonth()

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-3">
        <h1 className="text-lg font-extrabold tracking-tight sm:text-xl">インターン期間カレンダー</h1>
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
      <p className="mb-4 text-xs text-ink-faint">
        <span className="hidden md:inline">赤枠は期間が重なっているインターンです。応募前の確認にお使いください。</span>
        <span className="md:hidden">日付をタップすると、その日に開催中のインターンが下に表示されます。</span>
      </p>

      {internCompanies.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line-strong bg-white px-5 py-14 text-center">
          <p className="text-base font-bold text-ink-sub">インターン企業が登録されていません</p>
          <p className="mt-1 text-sm text-ink-faint">
            企業詳細の「選考」タブから、インターン期間を登録すると表示されます。
          </p>
        </div>
      ) : (
        <>
          <div className="mb-3 flex flex-wrap gap-3">
            {internCompanies.map((c) => (
              <span key={c.id} className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-sub">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: colorOf(c.id) }} />
                {c.name}
              </span>
            ))}
          </div>

          <InternshipMonthGrid
            month={month}
            bars={bars}
            colorOf={colorOf}
            selected={selected}
            onSelect={setSelected}
          />

          {/* モバイルのみ：選択日の一覧（デスクトップはバー表示で日程が見えるため不要） */}
          <div className="md:hidden">
            <InternshipDayPanel date={selected} bars={bars} colorOf={colorOf} />
          </div>
        </>
      )}
    </div>
  )
}