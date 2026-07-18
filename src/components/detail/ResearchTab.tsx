import { ChevronDown, ExternalLink, Plus, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { MAX_LEN } from '../../data/constants'
import { useCompanies } from '../../hooks/useCompanies'
import {
  RESEARCH_CATEGORIES,
  type Company,
  type CustomResearchCategory,
  type ResearchCategory,
  type ResearchEntry,
  type ResearchNotes,
} from '../../types'
import { uid } from '../../utils/id'
import { safeExternalHref } from '../../utils/url'
import CharCount from '../common/CharCount'
import SectionCard from '../common/SectionCard'

function hasContent(e: { url: string; summary: string; memo: string }): boolean {
  return Boolean(e.url || e.summary || e.memo)
}

/** 連続入力をまとめて保存するまでの待ち時間 */
const SAVE_DEBOUNCE_MS = 500

interface ResearchDraft {
  research: ResearchNotes
  custom: CustomResearchCategory[]
}

/** カテゴリ1件分の URL・要約・メモの入力欄（固定・カスタム共通） */
function EntryFields({
  entry,
  onChange,
}: {
  entry: { url: string; summary: string; memo: string }
  onChange: (patch: Partial<ResearchEntry>) => void
}) {
  const entryHref = safeExternalHref(entry.url)
  return (
    <div className="grid grid-cols-1 gap-3 border-t border-line px-4 py-4">
      <div>
        <label className="field-label flex items-center justify-between">
          URL
          {entryHref && (
            <a
              href={entryHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-brand hover:underline"
            >
              <ExternalLink size={12} />
              開く
            </a>
          )}
        </label>
        <input
          type="url"
          className="input"
          placeholder="https://（参照した記事・ページ）"
          maxLength={MAX_LEN.url}
          value={entry.url}
          onChange={(e) => onChange({ url: e.target.value })}
        />
      </div>
      <div>
        <label className="field-label">要約</label>
        <textarea
          className="input min-h-[70px] resize-y"
          placeholder="内容の要点を短くまとめる"
          maxLength={MAX_LEN.memo}
          value={entry.summary}
          onChange={(e) => onChange({ summary: e.target.value })}
        />
        <CharCount value={entry.summary} max={MAX_LEN.memo} />
      </div>
      <div>
        <label className="field-label">自分のメモ</label>
        <textarea
          className="input min-h-[70px] resize-y"
          placeholder="感じたこと、面接でどう使うか、志望理由との接続など"
          maxLength={MAX_LEN.memo}
          value={entry.memo}
          onChange={(e) => onChange({ memo: e.target.value })}
        />
        <CharCount value={entry.memo} max={MAX_LEN.memo} />
      </div>
    </div>
  )
}

export default function ResearchTab({ company }: { company: Company }) {
  const { updateCompany } = useCompanies()
  // 固定カテゴリはカテゴリ名、カスタムカテゴリは id で開閉状態を持つ
  const [openKeys, setOpenKeys] = useState<Set<string>>(
    () =>
      new Set<string>([
        ...RESEARCH_CATEGORIES.filter((cat) => hasContent(company.research[cat])),
        ...company.customResearch.filter(hasContent).map((c) => c.id),
      ]),
  )
  const [newCatName, setNewCatName] = useState('')

  // 入力はローカル draft に即時反映し、Firestore への保存はデバウンスでまとめる
  // （従来は1キーストロークごとにドキュメント全体を書き込んでいた）
  const [draft, setDraft] = useState<ResearchDraft>({
    research: company.research,
    custom: company.customResearch,
  })
  const draftRef = useRef(draft)
  const dirtyRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // stale closure を避けるため、常に最新の updateCompany を参照する
  const updateCompanyRef = useRef(updateCompany)
  updateCompanyRef.current = updateCompany

  const flush = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    if (!dirtyRef.current) return
    dirtyRef.current = false
    updateCompanyRef.current(company.id, (c) => ({
      ...c,
      research: draftRef.current.research,
      customResearch: draftRef.current.custom,
    }))
  }
  const flushRef = useRef(flush)
  flushRef.current = flush

  // タブ切替などでアンマウントされるとき、未保存の入力を確実に書き込む
  useEffect(() => {
    return () => flushRef.current()
  }, [])

  const commitDraft = (next: ResearchDraft, immediate = false) => {
    draftRef.current = next
    setDraft(next)
    dirtyRef.current = true
    if (timerRef.current) clearTimeout(timerRef.current)
    if (immediate) flushRef.current()
    else timerRef.current = setTimeout(() => flushRef.current(), SAVE_DEBOUNCE_MS)
  }

  const toggle = (key: string) => {
    const next = new Set(openKeys)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    setOpenKeys(next)
  }

  const setEntry = (cat: ResearchCategory, patch: Partial<ResearchEntry>) => {
    const d = draftRef.current
    commitDraft({ ...d, research: { ...d.research, [cat]: { ...d.research[cat], ...patch } } })
  }

  const setCustomEntry = (id: string, patch: Partial<ResearchEntry>) => {
    const d = draftRef.current
    commitDraft({ ...d, custom: d.custom.map((c) => (c.id === id ? { ...c, ...patch } : c)) })
  }

  const addCustomCategory = () => {
    const name = newCatName.trim()
    if (!name) return
    const cat: CustomResearchCategory = { id: uid(), name, url: '', summary: '', memo: '' }
    commitDraft({ ...draftRef.current, custom: [...draftRef.current.custom, cat] }, true)
    setNewCatName('')
    setOpenKeys((prev) => new Set(prev).add(cat.id))
  }

  const removeCustomCategory = (cat: CustomResearchCategory) => {
    if (hasContent(cat) && !window.confirm(`カテゴリ「${cat.name}」を削除しますか？記入した内容も削除されます。`)) {
      return
    }
    commitDraft(
      { ...draftRef.current, custom: draftRef.current.custom.filter((c) => c.id !== cat.id) },
      true,
    )
  }

  const filledCount =
    RESEARCH_CATEGORIES.filter((cat) => hasContent(draft.research[cat])).length +
    draft.custom.filter(hasContent).length

  return (
    <SectionCard title="企業研究ノート" count={filledCount}>
      <p className="mb-4 text-xs text-ink-faint">
        カテゴリごとに情報源のURL・要約・自分のメモを整理できます。入力内容は自動で保存されます。
      </p>
      <div className="flex flex-col gap-2.5">
        {RESEARCH_CATEGORIES.map((cat) => {
          const entry = draft.research[cat]
          const open = openKeys.has(cat)
          const filled = hasContent(entry)
          return (
            <div key={cat} className="overflow-hidden rounded-xl border border-line bg-white">
              <button
                type="button"
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-brand-ghost"
                onClick={() => toggle(cat)}
                aria-expanded={open}
              >
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${filled ? 'bg-brand' : 'bg-line-strong'}`}
                  title={filled ? '記入あり' : '未記入'}
                />
                <span className="flex-1 text-sm font-bold">{cat}</span>
                {!filled && <span className="text-xs text-ink-faint">未記入</span>}
                <ChevronDown
                  size={15}
                  className={`shrink-0 text-ink-faint transition ${open ? 'rotate-180' : ''}`}
                />
              </button>
              {open && <EntryFields entry={entry} onChange={(patch) => setEntry(cat, patch)} />}
            </div>
          )
        })}

        {draft.custom.map((cat) => {
          const open = openKeys.has(cat.id)
          const filled = hasContent(cat)
          return (
            <div key={cat.id} className="overflow-hidden rounded-xl border border-line bg-white">
              <div className="flex w-full items-center gap-3 px-4 py-3">
                <button
                  type="button"
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  onClick={() => toggle(cat.id)}
                  aria-expanded={open}
                >
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${filled ? 'bg-brand' : 'bg-line-strong'}`}
                    title={filled ? '記入あり' : '未記入'}
                  />
                  <span className="min-w-0 flex-1 truncate text-sm font-bold">{cat.name}</span>
                  {!filled && <span className="shrink-0 text-xs text-ink-faint">未記入</span>}
                  <ChevronDown
                    size={15}
                    className={`shrink-0 text-ink-faint transition ${open ? 'rotate-180' : ''}`}
                  />
                </button>
                <button
                  type="button"
                  className="icon-btn shrink-0 hover:border-danger hover:bg-danger-soft hover:text-danger"
                  onClick={() => removeCustomCategory(cat)}
                  aria-label={`カテゴリ「${cat.name}」を削除`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
              {open && <EntryFields entry={cat} onChange={(patch) => setCustomEntry(cat.id, patch)} />}
            </div>
          )
        })}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <input
          type="text"
          className="input flex-1"
          placeholder="カテゴリを追加（例：中期経営計画）"
          maxLength={MAX_LEN.label}
          value={newCatName}
          onChange={(e) => setNewCatName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addCustomCategory()}
        />
        <button
          type="button"
          className="btn-ghost shrink-0"
          onClick={addCustomCategory}
          disabled={!newCatName.trim()}
        >
          <Plus size={14} strokeWidth={2.6} />
          追加
        </button>
      </div>
    </SectionCard>
  )
}
