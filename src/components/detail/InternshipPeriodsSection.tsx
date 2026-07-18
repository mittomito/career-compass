import { Check, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { COMPANY_COLOR_PALETTE, MAX_LEN } from '../../data/constants'
import { useCompanies } from '../../hooks/useCompanies'
import type { Company } from '../../types'
import { fmtMD } from '../../utils/date'
import { uid } from '../../utils/id'
import SectionCard from '../common/SectionCard'

/** インターン企業のみ表示。開始日〜終了日で期間を複数登録できる */
export default function InternshipPeriodsSection({ company }: { company: Company }) {
  const { updateCompany } = useCompanies()
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ label: '', start: '', end: '' })

  const add = () => {
    if (!form.start || !form.end) return
    const startRaw = form.start
    const endRaw = form.end < form.start ? form.start : form.end
    updateCompany(company.id, (c) => ({
      ...c,
      internshipPeriods: [
        ...c.internshipPeriods,
        {
          id: uid(),
          label: form.label.trim(),
          startDate: new Date(`${startRaw}T00:00`).toISOString(),
          endDate: new Date(`${endRaw}T00:00`).toISOString(),
        },
      ],
    }))
    setForm({ label: '', start: '', end: '' })
    setAdding(false)
  }

  const remove = (id: string) =>
    updateCompany(company.id, (c) => ({
      ...c,
      internshipPeriods: c.internshipPeriods.filter((p) => p.id !== id),
    }))

  // 色は企業単位で1つ。この企業のすべてのインターン期間に同じ色が使われる
  const setColor = (color: string) => updateCompany(company.id, (c) => ({ ...c, color }))

  const periods = [...company.internshipPeriods].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
  )

  return (
    <SectionCard
      title="インターン期間"
      count={periods.length}
      action={
        <button type="button" className="btn-text" onClick={() => setAdding((v) => !v)}>
          <Plus size={14} strokeWidth={2.6} />
          期間を追加
        </button>
      }
    >
      <p className="mb-3 text-xs text-ink-faint">
        登録した期間は「インターン期間カレンダー」で他社の日程と重なっていないか確認できます。
      </p>

      <div className="mb-4">
        <p className="field-label">カレンダーでの表示色</p>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            className={`rounded-full border px-3 py-1 text-xs font-bold transition ${
              company.color === ''
                ? 'border-brand bg-brand-soft text-brand'
                : 'border-line-strong bg-white text-ink-sub'
            }`}
            onClick={() => setColor('')}
          >
            自動
          </button>
          {COMPANY_COLOR_PALETTE.map((color) => {
            const selected = company.color === color
            return (
              <button
                key={color}
                type="button"
                className={`inline-flex h-7 w-7 items-center justify-center rounded-full transition ${
                  selected ? 'ring-2 ring-ink ring-offset-2' : 'hover:scale-110'
                }`}
                style={{ background: color }}
                onClick={() => setColor(color)}
                aria-label={`表示色 ${color} を選択`}
                aria-pressed={selected}
              >
                {selected && <Check size={14} strokeWidth={3} className="text-white" />}
              </button>
            )
          })}
        </div>
      </div>

      {adding && (
        <div className="mb-4 grid grid-cols-1 gap-3 rounded-xl border border-line bg-brand-ghost p-4 md:grid-cols-3">
          <div>
            <label className="field-label">期間名（任意）</label>
            <input
              type="text"
              className="input"
              placeholder="例：本選考直結コース"
              maxLength={MAX_LEN.short}
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
            />
          </div>
          <div>
            <label className="field-label">開始日 *</label>
            <input
              type="date"
              className="input"
              value={form.start}
              onChange={(e) => setForm({ ...form, start: e.target.value })}
            />
          </div>
          <div>
            <label className="field-label">終了日 *</label>
            <input
              type="date"
              className="input"
              value={form.end}
              onChange={(e) => setForm({ ...form, end: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2 md:col-span-3">
            <button type="button" className="btn-ghost" onClick={() => setAdding(false)}>
              キャンセル
            </button>
            <button type="button" className="btn-primary" onClick={add}>
              追加する
            </button>
          </div>
        </div>
      )}

      {periods.length === 0 && !adding ? (
        <p className="py-2 text-sm text-ink-faint">まだ期間が登録されていません。</p>
      ) : (
        <div className="flex flex-col gap-2">
          {periods.map((p) => (
            <div key={p.id} className="flex items-center gap-3 rounded-xl border border-line bg-white px-4 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold">
                  {fmtMD(p.startDate)} 〜 {fmtMD(p.endDate)}
                </p>
                {p.label && <p className="text-xs text-ink-sub">{p.label}</p>}
              </div>
              <button
                type="button"
                className="icon-btn hover:border-danger hover:bg-danger-soft hover:text-danger"
                onClick={() => remove(p.id)}
                aria-label="この期間を削除"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  )
}