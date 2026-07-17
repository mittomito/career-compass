import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useState } from 'react'
import { STATUS_LIST, type CompanyStatus, type SelectionType } from '../../types'
import MultiSelectDropdown from '../common/MultiSelectDropdown'

export type TypeFilter = 'all' | SelectionType
export type StatusFilter = CompanyStatus[]
export type SortKey = 'next' | 'name'

interface Props {
  query: string
  onQuery: (v: string) => void
  typeFilter: TypeFilter
  onTypeFilter: (v: TypeFilter) => void
  statuses: StatusFilter
  onStatuses: (v: StatusFilter) => void
  sort: SortKey
  onSort: (v: SortKey) => void
  resultCount: number
  totalCount: number
}

const TYPE_CHIPS: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: 'すべて' },
  { value: 'インターン', label: 'インターン' },
  { value: '本選考', label: '本選考' },
]

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'next', label: '次回予定が近い順' },
  { value: 'name', label: '企業名順' },
]

/** 検索・フィルター・ソートをまとめたホームのツールバー */
export default function HomeToolbar(p: Props) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const activeFilterCount = p.statuses.length + (p.sort !== 'next' ? 1 : 0)

  return (
    <div className="mb-4 flex flex-col gap-2.5">
      <div className="flex flex-wrap items-center gap-2.5">
        <label className="flex min-w-[200px] flex-1 items-center gap-2 rounded-xl border border-line-strong bg-white px-3.5 py-2.5 text-ink-faint transition focus-within:border-brand focus-within:ring-[3px] focus-within:ring-brand-soft">
          <Search size={16} strokeWidth={2.2} />
          <input
            type="text"
            className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
            placeholder="企業名・インターン名・メモで検索"
            value={p.query}
            onChange={(e) => p.onQuery(e.target.value)}
          />
        </label>

        <div className="flex gap-1 rounded-xl border border-line bg-white p-1">
          {TYPE_CHIPS.map((c) => (
            <button
              key={c.value}
              type="button"
              className={`rounded-lg px-3.5 py-1 text-sm font-semibold transition ${
                p.typeFilter === c.value ? 'bg-brand text-white' : 'text-ink-sub hover:text-ink'
              }`}
              onClick={() => p.onTypeFilter(c.value)}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* モバイル：絞り込みボタン（ステータス・並び替えをシートに格納） */}
        <button
          type="button"
          className="icon-btn relative w-auto gap-1.5 px-3 md:hidden"
          onClick={() => setSheetOpen(true)}
        >
          <SlidersHorizontal size={15} />
          絞り込み
          {activeFilterCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* デスクトップ：インラインで常時表示 */}
        <div className="hidden items-center gap-2.5 md:flex">
          <MultiSelectDropdown
            label="ステータス"
            options={STATUS_LIST}
            selected={p.statuses}
            onChange={p.onStatuses}
          />
          <select
            className="input w-auto py-2 text-sm font-semibold text-ink-sub"
            value={p.sort}
            onChange={(e) => p.onSort(e.target.value as SortKey)}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <p className="text-right text-xs text-ink-faint">
        {p.resultCount}社 / 全{p.totalCount}社
      </p>

      {/* モバイル：絞り込みシート */}
      {sheetOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="閉じる"
            className="absolute inset-0 bg-ink/30"
            onClick={() => setSheetOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-2xl bg-white p-5 shadow-lift">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-extrabold">絞り込み・並び替え</h2>
              <button type="button" className="icon-btn" onClick={() => setSheetOpen(false)} aria-label="閉じる">
                <X size={16} />
              </button>
            </div>

            <p className="field-label">ステータス</p>
            <div className="mb-5 flex flex-wrap gap-2">
              {STATUS_LIST.map((s) => {
                const checked = p.statuses.includes(s)
                return (
                  <button
                    key={s}
                    type="button"
                    className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                      checked
                        ? 'border-brand bg-brand-soft text-brand'
                        : 'border-line-strong bg-white text-ink-sub'
                    }`}
                    onClick={() =>
                      p.onStatuses(checked ? p.statuses.filter((x) => x !== s) : [...p.statuses, s])
                    }
                  >
                    {s}
                  </button>
                )
              })}
            </div>

            <p className="field-label">並び替え</p>
            <div className="mb-6 flex flex-col gap-2">
              {SORT_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  className={`rounded-xl border px-4 py-2.5 text-left text-sm font-semibold transition ${
                    p.sort === o.value
                      ? 'border-brand bg-brand-soft text-brand'
                      : 'border-line-strong bg-white text-ink-sub'
                  }`}
                  onClick={() => p.onSort(o.value)}
                >
                  {o.label}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                className="btn-ghost flex-1"
                onClick={() => {
                  p.onStatuses([])
                  p.onSort('next')
                }}
              >
                リセット
              </button>
              <button type="button" className="btn-primary flex-1" onClick={() => setSheetOpen(false)}>
                この条件で見る
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}