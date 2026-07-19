import { Plus, X } from 'lucide-react'
import { useId, useState } from 'react'
import { MAX_LEN, SCHEDULE_TYPE_PRESETS } from '../../data/constants'
import type { Schedule } from '../../types'
import { uid } from '../../utils/id'

interface Props {
  /** カレンダーから開いたとき、選択中の日付を初期値にする（datetime-local 形式） */
  initialDate?: string
  onSubmit: (schedule: Schedule) => void
  onCancel: () => void
}

/**
 * 予定の入力フォーム。企業詳細の選考タブと、カレンダーの「予定を追加」の
 * 両方から同じ項目・同じ検証で使う共通部品。
 * 入力が揃っていれば Schedule を組み立てて onSubmit に渡す（保存先は呼び出し側が決める）。
 */
export default function ScheduleForm({ initialDate, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState({
    type: '',
    dates: [initialDate ?? ''],
    place: '',
    url: '',
    memo: '',
  })
  // 同じフォームが複数箇所で使われても datalist の id が衝突しないようにする
  const datalistId = useId()

  const setDate = (i: number, value: string) =>
    setForm({ ...form, dates: form.dates.map((d, j) => (j === i ? value : d)) })
  const addDateField = () => setForm({ ...form, dates: [...form.dates, ''] })
  const removeDateField = (i: number) =>
    setForm({ ...form, dates: form.dates.filter((_, j) => j !== i) })

  const submit = () => {
    const dates = form.dates
      .filter(Boolean)
      .map((d) => new Date(d).toISOString())
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
    if (!form.type.trim() || dates.length === 0) return
    onSubmit({
      id: uid(),
      type: form.type.trim(),
      date: dates[0],
      // 候補日が1つだけなら従来どおりの単一日付として保存する
      candidateDates: dates.length > 1 ? dates : undefined,
      place: form.place.trim() || undefined,
      url: form.url.trim() || undefined,
      memo: form.memo.trim() || undefined,
    })
  }

  return (
    <div className="mb-4 grid grid-cols-1 gap-3 rounded-xl border border-line bg-brand-ghost p-4 md:grid-cols-2">
      <div>
        <label className="field-label">種類 *</label>
        <input
          type="text"
          className="input"
          list={datalistId}
          placeholder="例：一次面接"
          maxLength={MAX_LEN.label}
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        />
        <datalist id={datalistId}>
          {SCHEDULE_TYPE_PRESETS.map((p) => (
            <option key={p} value={p} />
          ))}
        </datalist>
      </div>
      <div>
        <label className="field-label">日時 *</label>
        <div className="flex flex-col gap-2">
          {form.dates.map((d, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="datetime-local"
                className="input"
                value={d}
                onChange={(e) => setDate(i, e.target.value)}
              />
              {form.dates.length > 1 && (
                <button
                  type="button"
                  className="icon-btn shrink-0"
                  onClick={() => removeDateField(i)}
                  aria-label="この候補日を削除"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
        <button type="button" className="btn-text mt-1.5" onClick={addDateField}>
          <Plus size={13} strokeWidth={2.6} />
          候補日を追加
        </button>
        <p className="mt-0.5 text-xs text-ink-faint">
          企業から複数の候補日を提示されている場合は、すべて登録できます。
        </p>
      </div>
      <div>
        <label className="field-label">場所</label>
        <input
          type="text"
          className="input"
          placeholder="例：本社 / オンライン"
          maxLength={MAX_LEN.short}
          value={form.place}
          onChange={(e) => setForm({ ...form, place: e.target.value })}
        />
      </div>
      <div>
        <label className="field-label">URL</label>
        <input
          type="url"
          className="input"
          placeholder="https://"
          maxLength={MAX_LEN.url}
          value={form.url}
          onChange={(e) => setForm({ ...form, url: e.target.value })}
        />
      </div>
      <div className="md:col-span-2">
        <label className="field-label">メモ</label>
        <input
          type="text"
          className="input"
          placeholder="持ち物、注意点など"
          maxLength={MAX_LEN.note}
          value={form.memo}
          onChange={(e) => setForm({ ...form, memo: e.target.value })}
        />
      </div>
      <div className="flex justify-end gap-2 md:col-span-2">
        <button type="button" className="btn-ghost" onClick={onCancel}>
          キャンセル
        </button>
        <button type="button" className="btn-primary" onClick={submit}>
          予定を追加
        </button>
      </div>
    </div>
  )
}
