import { ChevronDown, ExternalLink } from 'lucide-react'
import { useState } from 'react'
import { useCompanies } from '../../hooks/useCompanies'
import { RESEARCH_CATEGORIES, type Company, type ResearchCategory, type ResearchEntry } from '../../types'
import SectionCard from '../common/SectionCard'

function hasContent(e: ResearchEntry): boolean {
  return Boolean(e.url || e.summary || e.memo)
}

export default function ResearchTab({ company }: { company: Company }) {
  const { updateCompany } = useCompanies()
  const [openCats, setOpenCats] = useState<Set<ResearchCategory>>(
    () => new Set(RESEARCH_CATEGORIES.filter((cat) => hasContent(company.research[cat]))),
  )

  const toggle = (cat: ResearchCategory) => {
    const next = new Set(openCats)
    if (next.has(cat)) next.delete(cat)
    else next.add(cat)
    setOpenCats(next)
  }

  const setEntry = (cat: ResearchCategory, patch: Partial<ResearchEntry>) =>
    updateCompany(company.id, (c) => ({
      ...c,
      research: { ...c.research, [cat]: { ...c.research[cat], ...patch } },
    }))

  const filledCount = RESEARCH_CATEGORIES.filter((cat) => hasContent(company.research[cat])).length

  return (
    <SectionCard title="企業研究ノート" count={filledCount}>
      <p className="mb-4 text-xs text-ink-faint">
        カテゴリごとに情報源のURL・要約・自分のメモを整理できます。入力内容は自動で保存されます。
      </p>
      <div className="flex flex-col gap-2.5">
        {RESEARCH_CATEGORIES.map((cat) => {
          const entry = company.research[cat]
          const open = openCats.has(cat)
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
              {open && (
                <div className="grid grid-cols-1 gap-3 border-t border-line px-4 py-4">
                  <div>
                    <label className="field-label flex items-center justify-between">
                      URL
                      {entry.url && (
                        <a
                          href={entry.url}
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
                      value={entry.url}
                      onChange={(e) => setEntry(cat, { url: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="field-label">要約</label>
                    <textarea
                      className="input min-h-[70px] resize-y"
                      placeholder="内容の要点を短くまとめる"
                      value={entry.summary}
                      onChange={(e) => setEntry(cat, { summary: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="field-label">自分のメモ</label>
                    <textarea
                      className="input min-h-[70px] resize-y"
                      placeholder="感じたこと、面接でどう使うか、志望理由との接続など"
                      value={entry.memo}
                      onChange={(e) => setEntry(cat, { memo: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </SectionCard>
  )
}
