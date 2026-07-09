import { ExternalLink, MapPin, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { KIND_STYLES, SCHEDULE_TYPE_PRESETS } from '../../data/constants'
import { useCompanies } from '../../hooks/useCompanies'
import type { Company } from '../../types'
import { fmtMDT, isPastDay, relLabel } from '../../utils/date'
import { kindOf } from '../../utils/events'
import { uid } from '../../utils/id'
import { safeExternalHref } from '../../utils/url'
import KindIcon from '../common/KindIcon'
import SectionCard from '../common/SectionCard'

type FormMode = 'none' | 'schedule' | 'deadline'

export default function ScheduleSection({ company }: { company: Company }) {
  const { updateCompany } = useCompanies()
  const [mode, setMode] = useState<FormMode>('none')
  const [sForm, setSForm] = useState({ type: '', date: '', place: '', url: '', memo: '' })
  const [dForm, setDForm] = useState({ label: '', date: '' })

  const addSchedule = () => {
    if (!sForm.type.trim() || !sForm.date) return
    updateCompany(company.id, (c) => ({
      ...c,
      schedules: [
        ...c.schedules,
        {
          id: uid(),
          type: sForm.type.trim(),
          date: new Date(sForm.date).toISOString(),
          place: sForm.place.trim() || undefined,
          url: sForm.url.trim() || undefined,
          memo: sForm.memo.trim() || undefined,
        },
      ],
    }))
    setSForm({ type: '', date: '', place: '', url: '', memo: '' })
    setMode('none')
  }

  const addDeadline = () => {
    if (!dForm.label.trim() || !dForm.date) return
    updateCompany(company.id, (c) => ({
      ...c,
      deadlines: [
        ...c.deadlines,
        { id: uid(), label: dForm.label.trim(), date: new Date(dForm.date).toISOString() },
      ],
    }))
    setDForm({ label: '', date: '' })
    setMode('none')
  }

  const removeSchedule = (id: string) =>
    updateCompany(company.id, (c) => ({ ...c, schedules: c.schedules.filter((s) => s.id !== id) }))
  const removeDeadline = (id: string) =>
    updateCompany(company.id, (c) => ({ ...c, deadlines: c.deadlines.filter((s) => s.id !== id) }))

  const deadlines = [...company.deadlines].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  )
  const schedules = [...company.schedules].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  )

  return (
    <SectionCard
      title="予定・締切"
      count={deadlines.length + schedules.length}
      action={
        <div className="flex gap-1.5">
          <button type="button" className="btn-text" onClick={() => setMode(mode === 'deadline' ? 'none' : 'deadline')}>
            <Plus size={14} strokeWidth={2.6} />
            締切を追加
          </button>
          <button type="button" className="btn-text" onClick={() => setMode(mode === 'schedule' ? 'none' : 'schedule')}>
            <Plus size={14} strokeWidth={2.6} />
            予定を追加
          </button>
        </div>
      }
    >
      {mode === 'schedule' && (
        <div className="mb-4 grid grid-cols-1 gap-3 rounded-xl border border-line bg-brand-ghost p-4 md:grid-cols-2">
          <div>
            <label className="field-label">種類 *</label>
            <input
              type="text"
              className="input"
              list="schedule-presets"
              placeholder="例：一次面接"
              value={sForm.type}
              onChange={(e) => setSForm({ ...sForm, type: e.target.value })}
            />
            <datalist id="schedule-presets">
              {SCHEDULE_TYPE_PRESETS.map((p) => (
                <option key={p} value={p} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="field-label">日時 *</label>
            <input
              type="datetime-local"
              className="input"
              value={sForm.date}
              onChange={(e) => setSForm({ ...sForm, date: e.target.value })}
            />
          </div>
          <div>
            <label className="field-label">場所</label>
            <input
              type="text"
              className="input"
              placeholder="例：本社 / オンライン"
              value={sForm.place}
              onChange={(e) => setSForm({ ...sForm, place: e.target.value })}
            />
          </div>
          <div>
            <label className="field-label">URL</label>
            <input
              type="url"
              className="input"
              placeholder="https://"
              value={sForm.url}
              onChange={(e) => setSForm({ ...sForm, url: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <label className="field-label">メモ</label>
            <input
              type="text"
              className="input"
              placeholder="持ち物、注意点など"
              value={sForm.memo}
              onChange={(e) => setSForm({ ...sForm, memo: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2 md:col-span-2">
            <button type="button" className="btn-ghost" onClick={() => setMode('none')}>
              キャンセル
            </button>
            <button type="button" className="btn-primary" onClick={addSchedule}>
              予定を追加
            </button>
          </div>
        </div>
      )}

      {mode === 'deadline' && (
        <div className="mb-4 grid grid-cols-1 gap-3 rounded-xl border border-line bg-danger-soft p-4 md:grid-cols-2">
          <div>
            <label className="field-label">締切の内容 *</label>
            <input
              type="text"
              className="input"
              placeholder="例：ES提出締切"
              value={dForm.label}
              onChange={(e) => setDForm({ ...dForm, label: e.target.value })}
            />
          </div>
          <div>
            <label className="field-label">日時 *</label>
            <input
              type="datetime-local"
              className="input"
              value={dForm.date}
              onChange={(e) => setDForm({ ...dForm, date: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2 md:col-span-2">
            <button type="button" className="btn-ghost" onClick={() => setMode('none')}>
              キャンセル
            </button>
            <button type="button" className="btn-primary" onClick={addDeadline}>
              締切を追加
            </button>
          </div>
        </div>
      )}

      {deadlines.length + schedules.length === 0 ? (
        <p className="py-2 text-sm text-ink-faint">予定はまだ登録されていません。</p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {deadlines.map((d) => (
            <div key={d.id} className="flex items-start gap-3.5 rounded-xl border border-line bg-white px-4 py-3">
              <KindIcon kind="締切" />
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 text-sm font-bold">
                  {d.label}
                  <span
                    className="rounded-full px-2 py-px text-xs font-bold"
                    style={{ color: KIND_STYLES['締切'].fg, background: KIND_STYLES['締切'].bg }}
                  >
                    {relLabel(d.date)}
                  </span>
                </p>
                <p className="mt-0.5 text-xs text-ink-sub">📅 {fmtMDT(d.date)}</p>
              </div>
              <button
                type="button"
                className="icon-btn hover:border-danger hover:bg-danger-soft hover:text-danger"
                onClick={() => removeDeadline(d.id)}
                aria-label="この締切を削除"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {schedules.map((s) => {
            const kind = kindOf(s.type)
            const scheduleHref = s.url ? safeExternalHref(s.url) : undefined
            return (
              <div key={s.id} className="flex items-start gap-3.5 rounded-xl border border-line bg-white px-4 py-3">
                <KindIcon kind={kind} />
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-bold">
                    {s.type}
                    {isPastDay(s.date) ? (
                      <span className="tag">終了</span>
                    ) : (
                      <span
                        className="rounded-full px-2 py-px text-xs font-bold"
                        style={{ color: KIND_STYLES[kind].fg, background: KIND_STYLES[kind].bg }}
                      >
                        {relLabel(s.date)}
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-ink-sub">
                    <span>📅 {fmtMDT(s.date)}</span>
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
