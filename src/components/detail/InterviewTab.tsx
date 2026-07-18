import { ChevronDown, Plus, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { useCompanies } from '../../hooks/useCompanies'
import type { Company, InterviewQA } from '../../types'
import { fmtMD } from '../../utils/date'
import { uid } from '../../utils/id'
import SectionCard from '../common/SectionCard'
import RejectionReflectionSection from './RejectionReflectionSection'

const EMPTY_QA: InterviewQA = { question: '', answer: '' }

function InterviewForm({
  onSave,
  onCancel,
}: {
  onSave: (draft: {
    date: string
    qas: InterviewQA[]
    reflection: string
    improvement: string
    nextNote: string
  }) => void
  onCancel: () => void
}) {
  const [date, setDate] = useState('')
  const [qas, setQas] = useState<InterviewQA[]>([{ ...EMPTY_QA }])
  const [reflection, setReflection] = useState('')
  const [improvement, setImprovement] = useState('')
  const [nextNote, setNextNote] = useState('')

  const setQa = (i: number, patch: Partial<InterviewQA>) =>
    setQas(qas.map((qa, j) => (j === i ? { ...qa, ...patch } : qa)))

  return (
    <div className="mb-4 rounded-xl border border-line bg-brand-ghost p-4">
      <div className="mb-3 max-w-[220px]">
        <label className="field-label">面接日 *</label>
        <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <span className="field-label">聞かれた質問と自分の回答</span>
      <div className="flex flex-col gap-2.5">
        {qas.map((qa, i) => (
          <div key={i} className="relative rounded-xl border border-line bg-white p-3">
            {qas.length > 1 && (
              <button
                type="button"
                className="icon-btn absolute right-2 top-2 h-7 w-7"
                onClick={() => setQas(qas.filter((_, j) => j !== i))}
                aria-label="この質問を削除"
              >
                <X size={13} />
              </button>
            )}
            <input
              type="text"
              className="input mb-2"
              placeholder={`質問 ${i + 1}（例：学生時代に頑張ったことは？）`}
              value={qa.question}
              onChange={(e) => setQa(i, { question: e.target.value })}
            />
            <textarea
              className="input min-h-[60px] resize-y"
              placeholder="自分の回答・手応え"
              value={qa.answer}
              onChange={(e) => setQa(i, { answer: e.target.value })}
            />
          </div>
        ))}
      </div>
      <button type="button" className="btn-text mt-2" onClick={() => setQas([...qas, { ...EMPTY_QA }])}>
        <Plus size={14} strokeWidth={2.6} />
        質問を追加
      </button>
      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <label className="field-label">反省</label>
          <textarea
            className="input min-h-[70px] resize-y"
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
          />
        </div>
        <div>
          <label className="field-label">次回改善点</label>
          <textarea
            className="input min-h-[70px] resize-y"
            value={improvement}
            onChange={(e) => setImprovement(e.target.value)}
          />
        </div>
      </div>
      <div className="mt-3">
        <label className="field-label">次回への一言</label>
        <input
          type="text"
          className="input"
          placeholder="（任意）次回はここを意識したい、と思ったことがあれば"
          value={nextNote}
          onChange={(e) => setNextNote(e.target.value)}
        />
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <button type="button" className="btn-ghost" onClick={onCancel}>
          キャンセル
        </button>
        <button
          type="button"
          className="btn-primary"
          onClick={() =>
            date &&
            onSave({
              date: new Date(`${date}T00:00`).toISOString(),
              qas: qas.filter((qa) => qa.question.trim()),
              reflection,
              improvement,
              nextNote,
            })
          }
        >
          保存する
        </button>
      </div>
    </div>
  )
}

export default function InterviewTab({ company }: { company: Company }) {
  const { updateCompany } = useCompanies()
  const [adding, setAdding] = useState(false)
  const [openIds, setOpenIds] = useState<Set<string>>(
    () => new Set(company.interviews.map((iv) => iv.id)),
  )

  const toggle = (id: string) => {
    const next = new Set(openIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setOpenIds(next)
  }

  const remove = (iv: { id: string; date: string }) => {
    // 振り返りの記録は復元できないため、削除前に確認する
    if (!window.confirm(`${fmtMD(iv.date)} の面接記録を削除しますか？この操作は取り消せません。`)) return
    updateCompany(company.id, (c) => ({
      ...c,
      interviews: c.interviews.filter((x) => x.id !== iv.id),
    }))
  }

  const interviews = [...company.interviews].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )

  return (
    <>
      <RejectionReflectionSection company={company} />
      <SectionCard
        title="面接の記録"
        count={company.interviews.length}
        action={
          <button type="button" className="btn-text" onClick={() => setAdding(true)}>
            <Plus size={14} strokeWidth={2.6} />
            面接を追加
          </button>
        }
      >
        {adding && (
          <InterviewForm
            onSave={(draft) => {
              const id = uid()
              updateCompany(company.id, (c) => ({
                ...c,
                interviews: [...c.interviews, { id, ...draft }],
              }))
              setOpenIds((prev) => new Set(prev).add(id))
              setAdding(false)
            }}
            onCancel={() => setAdding(false)}
          />
        )}
  
        {interviews.length === 0 && !adding ? (
          <p className="py-2 text-sm text-ink-faint">
            面接の記録はまだありません。終わった面接を振り返って記録しておくと、次の面接に活かせます。
          </p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {interviews.map((iv) => {
              const open = openIds.has(iv.id)
              return (
                <div key={iv.id} className="overflow-hidden rounded-xl border border-line bg-white">
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-brand-ghost"
                    onClick={() => toggle(iv.id)}
                    aria-expanded={open}
                  >
                    <span className="flex-1 text-sm font-bold">{fmtMD(iv.date)} の面接</span>
                    <span className="shrink-0 text-xs text-ink-faint">質問 {iv.qas.length}件</span>
                    <ChevronDown
                      size={15}
                      className={`shrink-0 text-ink-faint transition ${open ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {open && (
                    <div className="border-t border-line px-4 pb-4">
                      {iv.qas.map((qa, i) => (
                        <div key={i} className="mt-3">
                          <p className="text-[11px] font-extrabold tracking-widest text-ink-faint">聞かれた質問</p>
                          <p className="whitespace-pre-wrap break-words text-sm font-bold">{qa.question}</p>
                          <p className="mt-1.5 text-[11px] font-extrabold tracking-widest text-ink-faint">自分の回答</p>
                          <p className="whitespace-pre-wrap break-words text-sm">{qa.answer}</p>
                        </div>
                      ))}
                      <p className="mt-3.5 text-[11px] font-extrabold tracking-widest text-ink-faint">反省</p>
                      <p className="mt-1 whitespace-pre-wrap break-words rounded-r-xl border-l-[3px] border-warn bg-warn-soft px-3.5 py-2 text-sm">
                        {iv.reflection || '—'}
                      </p>
                      <p className="mt-3 text-[11px] font-extrabold tracking-widest text-ink-faint">次回改善点</p>
                      <p className="mt-1 whitespace-pre-wrap break-words rounded-r-xl border-l-[3px] border-success bg-success-soft px-3.5 py-2 text-sm">
                        {iv.improvement || '—'}
                      </p>
                      {iv.nextNote && (
                        <p className="mt-3 break-words text-sm text-ink-sub">
                          <span className="mr-1.5">💡</span>
                          {iv.nextNote}
                        </p>
                      )}
                      <div className="mt-3 flex justify-end">
                        <button
                          type="button"
                          className="btn-text text-danger hover:bg-danger-soft"
                          onClick={() => remove(iv)}
                        >
                          <Trash2 size={13} />
                          この記録を削除
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
    </>
  )
}
