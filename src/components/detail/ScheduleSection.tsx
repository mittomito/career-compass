import { AlertTriangle, ExternalLink, MapPin, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { KIND_STYLES } from '../../data/constants'
import { useCompanies } from '../../hooks/useCompanies'
import type { Company, Schedule } from '../../types'
import { daysLeft, fmtMDT, relLabel } from '../../utils/date'
import { kindOf, scheduleDates } from '../../utils/events'
import { safeExternalHref } from '../../utils/url'
import KindIcon from '../common/KindIcon'
import SectionCard from '../common/SectionCard'
import ScheduleForm from './ScheduleForm'

/** 予定の「効きの日付」：今日以降で最も近い候補日。すべて過ぎていれば最後の候補日 */
function effectiveDate(s: Schedule): { date: string; past: boolean } {
  const t = new Date().setHours(0, 0, 0, 0)
  const dates = [...scheduleDates(s)].sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime(),
  )
  const upcoming = dates.find((d) => new Date(d).getTime() >= t)
  return upcoming ? { date: upcoming, past: false } : { date: dates[dates.length - 1], past: true }
}

export default function ScheduleSection({ company }: { company: Company }) {
  const { updateCompany } = useCompanies()
  const [adding, setAdding] = useState(false)

  const addSchedule = (schedule: Schedule) => {
    updateCompany(company.id, (c) => ({
      ...c,
      schedules: [...c.schedules, schedule],
    }))
    setAdding(false)
  }

  // 旧「締切」から移行された予定（id が dl- で始まる）を削除するときは、
  // 変換元の deadlines も一緒に取り除き、次回読み込みで復活しないようにする
  const removeSchedule = (id: string) =>
    updateCompany(company.id, (c) => ({
      ...c,
      schedules: c.schedules.filter((s) => s.id !== id),
      deadlines: id.startsWith('dl-')
        ? c.deadlines?.filter((d) => `dl-${d.id}` !== id)
        : c.deadlines,
    }))

  const schedules = [...company.schedules].sort(
    (a, b) =>
      new Date(effectiveDate(a).date).getTime() - new Date(effectiveDate(b).date).getTime(),
  )

  return (
    <SectionCard
      title="予定"
      count={schedules.length}
      action={
        <button type="button" className="btn-text" onClick={() => setAdding((v) => !v)}>
          <Plus size={14} strokeWidth={2.6} />
          予定を追加
        </button>
      }
    >
      {adding && <ScheduleForm onSubmit={addSchedule} onCancel={() => setAdding(false)} />}

      {schedules.length === 0 ? (
        <p className="py-2 text-sm text-ink-faint">予定はまだ登録されていません。</p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {schedules.map((s) => {
            const kind = kindOf(s.type)
            const scheduleHref = s.url ? safeExternalHref(s.url) : undefined
            const dates = scheduleDates(s)
            const { date: primary, past } = effectiveDate(s)
            // 種類を問わず、3日以内に迫った予定は強調して緊急度を伝える
            const urgent = !past && daysLeft(primary) <= 3
            return (
              <div
                key={s.id}
                className={`flex items-start gap-3.5 rounded-xl border bg-white px-4 py-3 ${
                  urgent ? 'border-danger bg-danger-soft/40' : 'border-line'
                }`}
              >
                <KindIcon kind={kind} />
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-bold">
                    {s.type}
                    {past ? (
                      <span className="tag">終了</span>
                    ) : urgent ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-danger-soft px-2 py-px text-xs font-bold text-danger">
                        <AlertTriangle size={11} strokeWidth={2.6} />
                        {relLabel(primary)}
                      </span>
                    ) : (
                      <span
                        className="rounded-full px-2 py-px text-xs font-bold"
                        style={{ color: KIND_STYLES[kind].fg, background: KIND_STYLES[kind].bg }}
                      >
                        {relLabel(primary)}
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-ink-sub">
                    {dates.length > 1 ? (
                      <span>📅 候補日: {dates.map((d) => fmtMDT(d)).join(' / ')}</span>
                    ) : (
                      <span>📅 {fmtMDT(primary)}</span>
                    )}
                    {s.place && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={12} />
                        {s.place}
                      </span>
                    )}
                    {scheduleHref && (
                      <a
                        href={scheduleHref}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-brand hover:underline"
                      >
                        <ExternalLink size={12} />
                        リンクを開く
                      </a>
                    )}
                  </p>
                  {s.memo && (
                    <p className="mt-1.5 whitespace-pre-wrap break-words rounded-lg bg-brand-ghost px-2.5 py-1.5 text-xs text-ink-sub">
                      {s.memo}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  className="icon-btn hover:border-danger hover:bg-danger-soft hover:text-danger"
                  onClick={() => removeSchedule(s.id)}
                  aria-label="この予定を削除"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </SectionCard>
  )
}
