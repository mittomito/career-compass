import { ChevronDown, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useCompanies } from '../../hooks/useCompanies'
import type { Company, EsEntry } from '../../types'
import { fmtMD, toInputDate } from '../../utils/date'
import { uid } from '../../utils/id'
import SectionCard from '../common/SectionCard'

interface EsDraft {
  question: string
  answer: string
  limit: number
  submittedAt: string
}

const EMPTY_DRAFT: EsDraft = { question: '', answer: '', limit: 400, submittedAt: '' }

function EsForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: EsDraft
  onSave: (draft: EsDraft) => void
  onCancel: () => void
}) {
  const [draft, setDraft] = useState<EsDraft>(initial)
  const over = draft.answer.length > draft.limit

  return (
    <div className="mb-4 rounded-xl border border-line bg-brand-ghost p-4">
      <div className="mb-3">
        <label className="field-label">設問 *</label>
        <textarea
          className="input min-h-[52px] resize-y"
          placeholder="例：学生時代に最も力を入れたことを教えてください。"
          value={draft.question}
          onChange={(e) => setDraft({ ...draft, question: e.target.value })}
        />
      </div>
      <div className="mb-3">
        <div className="mb-1.5 flex items-end justify-between">
          <label className="field-label mb-0">回答</label>
          <span className={`text-xs font-bold ${over ? 'text-danger' : 'text-ink-faint'}`}>
            {draft.answer.length} / {draft.limit}字{over && '（超過）'}
          </span>
        </div>
        <textarea
          className={`input min-h-[140px] resize-y ${over ? 'border-danger' : ''}`}
          value={draft.answer}
          onChange={(e) => setDraft({ ...draft, answer: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label">文字数制限</label>
          <input
            type="number"
            min={1}
            className="input"
            value={draft.limit}
            onChange={(e) => setDraft({ ...draft, limit: Math.max(1, Number(e.target.value) || 1) })}
          />
        </div>
        <div>
          <label className="field-label">提出日（未提出なら空欄）</label>
          <input
            type="date"
            className="input"
            value={draft.submittedAt}
            onChange={(e) => setDraft({ ...draft, submittedAt: e.target.value })}
          />
        </div>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <button type="button" className="btn-ghost" onClick={onCancel}>
          キャンセル
        </button>
        <button
          type="button"
          className="btn-primary"
          onClick={() => draft.question.trim() && onSave(draft)}
        >
          保存する
        </button>
      </div>
    </div>
  )
}

export default function EsTab({ company }: { company: Company }) {
  const { updateCompany } = useCompanies()
  const [openIds, setOpenIds] = useState<Set<string>>(new Set())
  const [editingId, setEditingId] = useState<string | 'new' | null>(null)

  const toggle = (id: string) => {
    const next = new Set(openIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setOpenIds(next)
  }

  const toEntry = (draft: EsDraft, id: string): EsEntry => ({
    id,
    question: draft.question.trim(),
    answer: draft.answer,
    limit: draft.limit,
    submittedAt: draft.submittedAt ? new Date(`${draft.submittedAt}T00:00`).toISOString() : null,
  })

  const save = (draft: EsDraft) => {
    if (editingId === 'new') {
      updateCompany(company.id, (c) => ({
        ...c,
        esEntries: [...c.esEntries, toEntry(draft, uid())],
      }))
    } else if (editingId) {
      updateCompany(company.id, (c) => ({
        ...c,
        esEntries: c.esEntries.map((e) => (e.id === editingId ? toEntry(draft, e.id) : e)),
      }))
    }
    setEditingId(null)
  }

  const remove = (entry: EsEntry) => {
    // 回答本文は書き直しが難しいため、誤タップによる消失を確認ダイアログで防ぐ
    const head = entry.question.length > 20 ? `${entry.question.slice(0, 20)}…` : entry.question
    if (!window.confirm(`「${head}」を削除しますか？この操作は取り消せません。`)) return
    updateCompany(company.id, (c) => ({
      ...c,
      esEntries: c.esEntries.filter((e) => e.id !== entry.id),
    }))
  }

  return (
    <SectionCard
      title="エントリーシート"
      count={company.esEntries.length}
      action={
        <button type="button" className="btn-text" onClick={() => setEditingId('new')}>
          <Plus size={14} strokeWidth={2.6} />
          設問を追加
        </button>
      }
    >
      {editingId === 'new' && (
        <EsForm initial={EMPTY_DRAFT} onSave={save} onCancel={() => setEditingId(null)} />
      )}

      {company.esEntries.length === 0 && editingId !== 'new' ? (
        <p className="py-2 text-sm text-ink-faint">
          ESはまだ登録されていません。「設問を追加」から作成できます。
        </p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {company.esEntries.map((e, i) => {
            if (editingId === e.id) {
              return (
                <EsForm
                  key={e.id}
                  initial={{
                    question: e.question,
                    answer: e.answer,
                    limit: e.limit,
                    submittedAt: e.submittedAt ? toInputDate(e.submittedAt) : '',
                  }}
                  onSave={save}
                  onCancel={() => setEditingId(null)}
                />
              )
            }
            const open = openIds.has(e.id)
            const over = e.answer.length > e.limit
            return (
              <div key={e.id} className="overflow-hidden rounded-xl border border-line bg-white">
                <button
                  type="button"
                  className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-brand-ghost"
                  onClick={() => toggle(e.id)}
                  aria-expanded={open}
                >
                  <span className="min-w-0 flex-1 whitespace-pre-wrap break-words text-sm font-bold leading-relaxed">
                    Q{i + 1}. {e.question}
                  </span>
                  <span className="flex shrink-0 items-center gap-2.5 pt-0.5 text-xs text-ink-faint">
                    <span className={over ? 'font-bold text-danger' : ''}>
                      {e.answer.length} / {e.limit}字
                    </span>
                    {e.submittedAt ? (
                      <span>提出 {fmtMD(e.submittedAt)}</span>
                    ) : (
                      <span className="font-bold text-warn">下書き</span>
                    )}
                    <ChevronDown
                      size={15}
                      className={`shrink-0 transition ${open ? 'rotate-180' : ''}`}
                    />
                  </span>
                </button>
                {open && (
                  <div className="border-t border-line px-4 pb-4">
                    <div className="mt-3 whitespace-pre-wrap break-words rounded-xl bg-brand-ghost px-3.5 py-3 text-sm">
                      {e.answer || '（未記入）'}
                    </div>
                    <div className="mt-3 flex justify-end gap-1.5">
                      <button type="button" className="btn-text" onClick={() => setEditingId(e.id)}>
                        <Pencil size={13} />
                        編集
                      </button>
                      <button
                        type="button"
                        className="btn-text text-danger hover:bg-danger-soft"
                        onClick={() => remove(e)}
                      >
                        <Trash2 size={13} />
                        削除
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </SectionCard>
  )
}