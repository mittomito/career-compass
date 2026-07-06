import { CalendarClock, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { KIND_STYLES } from '../../data/constants'
import { useCompanies } from '../../hooks/useCompanies'
import { daysLeft, fmtTime } from '../../utils/date'
import { buildEvents } from '../../utils/events'

export default function TodayStrip() {
  const { companies } = useCompanies()
  const navigate = useNavigate()

  const items = buildEvents(companies).filter((e) => {
    const n = daysLeft(e.date.toISOString())
    return n === 0 || n === 1
  })
  const todayCount = items.filter((e) => daysLeft(e.date.toISOString()) === 0).length
  const tomorrowCount = items.length - todayCount

  return (
    <>
      {/* モバイル：件数のみのコンパクト表示 */}
      <button
        type="button"
        onClick={() => navigate('/calendar')}
        className="card mb-4 flex w-full items-center gap-3 px-4 py-3 text-left md:hidden"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
          <CalendarClock size={17} strokeWidth={2.2} />
        </span>
        <span className="flex-1 text-sm">
          {items.length === 0 ? (
            <span className="text-ink-faint">今日・明日の予定はありません</span>
          ) : (
            <span className="font-bold">
              今日 {todayCount}件 ・ 明日 {tomorrowCount}件
            </span>
          )}
        </span>
      </button>

      {/* デスクトップ：詳細一覧表示 */}
      <div className="card mb-6 hidden flex-wrap items-start gap-4 px-5 py-4 md:flex">
        <div className="flex min-w-[130px] items-center gap-2 pt-0.5 text-[15px] font-extrabold">
          <Clock size={17} strokeWidth={2.2} className="text-brand" />
          今日・明日の予定
        </div>
        {items.length === 0 ? (
          <p className="pt-1 text-sm text-ink-faint">今日・明日の予定はありません。ゆっくり準備を進めましょう 🍵</p>
        ) : (
          <div className="flex flex-1 flex-wrap gap-2.5">
            {items.map((e) => (
              <button
                key={e.id}
                type="button"
                className="flex items-center gap-2 rounded-xl border border-line bg-brand-ghost px-3 py-1.5 text-sm transition hover:border-brand hover:bg-brand-soft"
                onClick={() => navigate(`/companies/${e.companyId}?tab=selection`)}
              >
                <span className="h-2 w-2 rounded-full" style={{ background: KIND_STYLES[e.kind].main }} />
                <b className="font-bold">{e.companyName}</b>
                <span className="text-ink-sub">
                  {e.label} ・ {daysLeft(e.date.toISOString()) === 0 ? '今日' : '明日'} {fmtTime(e.date.toISOString())}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  )
}