import { Check, Search, X } from 'lucide-react'
import { useState } from 'react'
import { useCompanies } from '../../hooks/useCompanies'
import type { Schedule } from '../../types'
import { toInputDate } from '../../utils/date'
import ScheduleForm from '../detail/ScheduleForm'

interface Props {
  /** カレンダーで選択中の日付。フォームの日時の初期値になる */
  date: Date
  onClose: () => void
}

/**
 * カレンダーから直接予定を追加するダイアログ。
 * どの企業の予定かを検索付きリストで選んだうえで、選考タブと同じ共通フォーム
 * （ScheduleForm）で入力し、その企業の schedules に追加する。
 */
export default function AddScheduleDialog({ date, onClose }: Props) {
  const { companies, updateCompany } = useCompanies()
  const [companyId, setCompanyId] = useState('')
  const [companyError, setCompanyError] = useState(false)
  const [query, setQuery] = useState('')

  const sorted = [...companies].sort((a, b) => a.name.localeCompare(b.name, 'ja'))
  // 企業数が多くても目的の企業を選べるよう、名前・選考名・業界で絞り込めるようにする
  const q = query.trim().toLowerCase()
  const filtered = q
    ? sorted.filter((c) => `${c.name}${c.title}${c.industry}`.toLowerCase().includes(q))
    : sorted
  const selected = companies.find((c) => c.id === companyId)

  // 選択中の日付を初期値にする。時刻はあとから直す前提の仮の値（9:00）
  const initialDate = `${toInputDate(date.toISOString())}T09:00`

  const pick = (id: string) => {
    setCompanyId(id)
    setCompanyError(false)
  }

  const save = (schedule: Schedule) => {
    if (!companyId) {
      setCompanyError(true)
      return
    }
    updateCompany(companyId, (c) => ({ ...c, schedules: [...c.schedules, schedule] }))
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      {/* ダイアログ外をタップしたら閉じるための背景 */}
      <button
        type="button"
        aria-label="閉じる"
        className="absolute inset-0 bg-ink/30"
        onClick={onClose}
      />
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-white p-5 shadow-lift sm:rounded-2xl sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-extrabold">
            {date.getMonth() + 1}月{date.getDate()}日の予定を追加
          </h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="閉じる">
            <X size={16} />
          </button>
        </div>

        {companies.length === 0 ? (
          <p className="py-2 text-sm text-ink-faint">
            企業がまだ登録されていません。先にヘッダーの「企業を登録」から企業を追加してください。
          </p>
        ) : (
          <>
            <div className="mb-4">
              <label className="field-label">企業 *</label>
              <div
                className={`overflow-hidden rounded-xl border bg-white ${
                  companyError && !companyId ? 'border-danger' : 'border-line-strong'
                }`}
              >
                <label className="flex items-center gap-2 border-b border-line px-3.5 py-2.5 text-ink-faint focus-within:text-brand">
                  <Search size={15} strokeWidth={2.2} />
                  <input
                    type="text"
                    className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
                    placeholder="企業名・インターン名で検索"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    // Enter で絞り込み結果の先頭を選択できるようにする（マウス往復を減らす）
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && filtered.length > 0) {
                        e.preventDefault()
                        pick(filtered[0].id)
                      }
                    }}
                  />
                </label>
                <ul className="max-h-44 overflow-y-auto p-1" role="listbox" aria-label="企業を選択">
                  {filtered.length === 0 ? (
                    <li className="px-3 py-2 text-sm text-ink-faint">該当する企業がありません</li>
                  ) : (
                    filtered.map((c) => {
                      const isSelected = c.id === companyId
                      return (
                        <li key={c.id}>
                          <button
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition ${
                              isSelected
                                ? 'bg-brand-soft font-bold text-brand'
                                : 'text-ink hover:bg-brand-ghost'
                            }`}
                            onClick={() => pick(c.id)}
                          >
                            <span className="min-w-0 flex-1 truncate">
                              {c.name}
                              <span
                                className={`ml-1.5 text-xs font-normal ${
                                  isSelected ? 'text-brand/80' : 'text-ink-faint'
                                }`}
                              >
                                {c.title}
                              </span>
                            </span>
                            {isSelected && <Check size={15} className="shrink-0" />}
                          </button>
                        </li>
                      )
                    })
                  )}
                </ul>
              </div>
              {selected && (
                <p className="mt-1 text-xs font-semibold text-ink-sub">
                  選択中：<span className="text-brand">{selected.name}</span>
                </p>
              )}
              {companyError && !companyId && (
                <p className="mt-1 text-xs font-semibold text-danger">
                  どの企業の予定かを選択してください。
                </p>
              )}
            </div>
            <ScheduleForm initialDate={initialDate} onSubmit={save} onCancel={onClose} />
          </>
        )}
      </div>
    </div>
  )
}
