import { ExternalLink, Pencil } from 'lucide-react'
import { useState } from 'react'
import { INDUSTRIES, MAX_LEN } from '../../data/constants'
import CharCount from '../common/CharCount'
import { useCompanies } from '../../hooks/useCompanies'
import type { Company, SelectionType } from '../../types'
import { safeExternalHref } from '../../utils/url'
import SectionCard from '../common/SectionCard'

export default function BasicInfoTab({ company }: { company: Company }) {
  const { updateCompany } = useCompanies()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState({
    name: company.name,
    industry: company.industry,
    type: company.type,
    title: company.title,
    mypageUrl: company.mypageUrl,
    loginId: company.loginId,
    memo: company.memo,
  })

  const startEdit = () => {
    setDraft({
      name: company.name,
      industry: company.industry,
      type: company.type,
      title: company.title,
      mypageUrl: company.mypageUrl,
      loginId: company.loginId,
      memo: company.memo,
    })
    setEditing(true)
  }

  const save = () => {
    updateCompany(company.id, (c) => ({
      ...c,
      ...draft,
      // 企業名を空にはできない。空で保存しようとした場合は元の名前を維持する
      name: draft.name.trim() || c.name,
    }))
    setEditing(false)
  }

  if (!editing) {
    const mypageHref = safeExternalHref(company.mypageUrl)
    return (
      <SectionCard
        title="基本情報"
        action={
          <button type="button" className="btn-text" onClick={startEdit}>
            <Pencil size={14} />
            編集
          </button>
        }
      >
        <dl className="grid grid-cols-1 gap-x-4 gap-y-3 text-[15px] md:grid-cols-[150px_1fr]">
          <dt className="pt-px text-[13px] font-bold text-ink-faint">企業名</dt>
          <dd>{company.name}</dd>
          <dt className="pt-px text-[13px] font-bold text-ink-faint">業界</dt>
          <dd>{company.industry}</dd>
          <dt className="pt-px text-[13px] font-bold text-ink-faint">選考区分</dt>
          <dd className="flex items-center gap-2">
            <span className="tag">{company.type}</span>
            {company.title}
          </dd>
          <dt className="pt-px text-[13px] font-bold text-ink-faint">マイページURL</dt>
          <dd>
            {mypageHref ? (
              <a
                href={mypageHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-brand hover:underline"
              >
                {company.mypageUrl}
                <ExternalLink size={13} />
              </a>
            ) : company.mypageUrl ? (
              <span className="break-all">{company.mypageUrl}</span>
            ) : (
              <span className="text-ink-faint">未登録</span>
            )}
          </dd>
          <dt className="pt-px text-[13px] font-bold text-ink-faint">ログインID</dt>
          <dd>
            {company.loginId ? (
              <code className="rounded-md border border-line bg-brand-ghost px-2 py-0.5 text-[13px]">
                {company.loginId}
              </code>
            ) : (
              <span className="text-ink-faint">未登録</span>
            )}
          </dd>
          <dt className="pt-px text-[13px] font-bold text-ink-faint">メモ</dt>
          <dd className="whitespace-pre-wrap break-words">
            {company.memo || <span className="text-ink-faint">—</span>}
          </dd>
        </dl>
        <p className="mt-4 text-xs text-ink-faint">
          ※ セキュリティのため、パスワードはこのアプリには保存できません。
        </p>
      </SectionCard>
    )
  }

  return (
    <SectionCard title="基本情報を編集">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="field-label">企業名 *</label>
          <input
            type="text"
            className="input"
            maxLength={MAX_LEN.short}
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          />
        </div>
        <div>
          <label className="field-label">業界</label>
          <select
            className="input"
            value={draft.industry}
            onChange={(e) => setDraft({ ...draft, industry: e.target.value })}
          >
            {INDUSTRIES.map((i) => (
              <option key={i}>{i}</option>
            ))}
          </select>
        </div>
        <div>
          <span className="field-label">選考区分</span>
          <div className="flex gap-2">
            {(['インターン', '本選考'] as SelectionType[]).map((t) => (
              <button
                key={t}
                type="button"
                className={`flex-1 rounded-xl border py-2 text-sm font-bold transition ${
                  draft.type === t
                    ? 'border-brand bg-brand-soft text-brand'
                    : 'border-line-strong bg-white text-ink-sub'
                }`}
                onClick={() => setDraft({ ...draft, type: t })}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="md:col-span-2">
          <label className="field-label">インターン名 / 本選考名</label>
          <input
            type="text"
            className="input"
            maxLength={MAX_LEN.short}
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          />
        </div>
        <div>
          <label className="field-label">マイページURL</label>
          <input
            type="url"
            className="input"
            placeholder="https://"
            maxLength={MAX_LEN.url}
            value={draft.mypageUrl}
            onChange={(e) => setDraft({ ...draft, mypageUrl: e.target.value })}
          />
        </div>
        <div>
          <label className="field-label">ログインID</label>
          <input
            type="text"
            className="input"
            maxLength={MAX_LEN.short}
            value={draft.loginId}
            onChange={(e) => setDraft({ ...draft, loginId: e.target.value })}
          />
          <p className="mt-1 text-xs text-ink-faint">パスワードは保存できません。</p>
        </div>
        <div className="md:col-span-2">
          <label className="field-label">メモ</label>
          <textarea
            className="input min-h-[80px] resize-y"
            maxLength={MAX_LEN.memo}
            value={draft.memo}
            onChange={(e) => setDraft({ ...draft, memo: e.target.value })}
          />
          <CharCount value={draft.memo} max={MAX_LEN.memo} />
        </div>
      </div>
      <div className="mt-5 flex justify-end gap-2.5">
        <button type="button" className="btn-ghost" onClick={() => setEditing(false)}>
          キャンセル
        </button>
        <button type="button" className="btn-primary" onClick={save}>
          保存する
        </button>
      </div>
    </SectionCard>
  )
}
