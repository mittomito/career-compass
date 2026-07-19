import {
  ChevronDown,
  ChevronRight,
  CopyPlus,
  Pencil,
  Plus,
  Trash2,
  Users,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MAX_LEN } from '../../data/constants'
import { useCompanies } from '../../hooks/useCompanies'
import { useObOgPrep } from '../../hooks/useObOgPrep'
import type { Company, ObOgQA, ObOgQuestion, ObOgVisit } from '../../types'
import { toInputDate } from '../../utils/date'
import { uid } from '../../utils/id'
import CharCount from '../common/CharCount'
import SectionCard from '../common/SectionCard'

interface VisitDraft {
  date: string
  person: string
  qas: ObOgQA[]
  memo: string
  insight: string
}

function emptyDraft(): VisitDraft {
  return {
    date: toInputDate(new Date().toISOString()),
    person: '',
    qas: [],
    memo: '',
    insight: '',
  }
}

/**
 * テンプレートの質問から、取り込みたいものを個別に選ぶピッカー。
 * 面接対策の「全件コピー」と違い、チェックした質問だけを追加する。
 */
function TemplatePicker({
  questions,
  onAdd,
  onClose,
}: {
  questions: ObOgQuestion[]
  onAdd: (texts: string[]) => void
  onClose: () => void
}) {
  const [checked, setChecked] = useState<Set<string>>(new Set())

  const toggle = (id: string) => {
    const next = new Set(checked)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setChecked(next)
  }

  const add = () => {
    const texts = questions.filter((q) => checked.has(q.id)).map((q) => q.text)
    if (texts.length === 0) return
    onAdd(texts)
    onClose()
  }

  return (
    <div className="mb-3 rounded-xl border border-line bg-white p-3">
      <p className="mb-2 text-xs font-semibold text-ink-sub">
        取り込む質問を選んでください（複数選択できます）。
      </p>
      {questions.length === 0 ? (
        <p className="py-1 text-sm text-ink-faint">
          テンプレートに質問が登録されていません。「OB・OG訪問テンプレート」ページで作成できます。
        </p>
      ) : (
        <div className="flex max-h-56 flex-col gap-1 overflow-y-auto">
          {questions.map((q) => (
            <label
              key={q.id}
              className="flex cursor-pointer items-start gap-2.5 rounded-lg px-2 py-1.5 transition hover:bg-brand-ghost"
            >
              <input
                type="checkbox"
                className="mt-0.5 accent-brand"
                checked={checked.has(q.id)}
                onChange={() => toggle(q.id)}
              />
              <span className="min-w-0 break-words text-sm">{q.text}</span>
            </label>
          ))}
        </div>
      )}
      <div className="mt-3 flex justify-end gap-2">
        <button type="button" className="btn-ghost" onClick={onClose}>
          キャンセル
        </button>
        <button
          type="button"
          className="btn-primary disabled:pointer-events-none disabled:opacity-40"
          onClick={add}
          disabled={checked.size === 0}
        >
          選択した{checked.size > 0 ? `${checked.size}件を` : '質問を'}追加
        </button>
      </div>
    </div>
  )
}

function VisitForm({
  initial,
  templateQuestions,
  templateLoading,
  templateError,
  onSave,
  onCancel,
}: {
  initial: VisitDraft
  templateQuestions: ObOgQuestion[]
  templateLoading: boolean
  templateError: boolean
  onSave: (draft: VisitDraft) => void
  onCancel: () => void
}) {
  const [draft, setDraft] = useState<VisitDraft>(initial)
  const [pickerOpen, setPickerOpen] = useState(false)

  const setQa = (i: number, patch: Partial<ObOgQA>) =>
    setDraft({
      ...draft,
      qas: draft.qas.map((qa, j) => (j === i ? { ...qa, ...patch } : qa)),
    })
  const removeQa = (i: number) =>
    setDraft({ ...draft, qas: draft.qas.filter((_, j) => j !== i) })
  const addQa = () => setDraft({ ...draft, qas: [...draft.qas, { question: '', answer: '' }] })
  // テンプレートから選んだ質問を、回答が空の状態でコピーする（以後はテンプレートから独立）
  const addFromTemplate = (texts: string[]) =>
    setDraft({
      ...draft,
      qas: [...draft.qas, ...texts.map((question) => ({ question, answer: '' }))],
    })

  const openPicker = () => {
    // 読み込み失敗中は「テンプレートが空」と誤認させないよう、専用の案内を出す
    if (templateError) {
      alert('OB・OG訪問テンプレートの読み込みに失敗しています。ページを再読み込みしてからお試しください。')
      return
    }
    setPickerOpen((v) => !v)
  }

  const save = () => {
    if (!draft.date) return
    // 質問・回答とも空の行だけ保存から除く（回答が空でも、質問があれば残る）
    onSave({ ...draft, qas: draft.qas.filter((qa) => qa.question.trim() || qa.answer.trim()) })
  }

  return (
    <div className="mb-4 grid grid-cols-1 gap-3 rounded-xl border border-line bg-brand-ghost p-4 md:grid-cols-2">
      <div>
        <label className="field-label">訪問日 *</label>
        <input
          type="date"
          className="input"
          value={draft.date}
          onChange={(e) => setDraft({ ...draft, date: e.target.value })}
        />
      </div>
      <div>
        <label className="field-label">話を聞いた相手</label>
        <input
          type="text"
          className="input"
          placeholder="例：営業部・入社3年目の方"
          maxLength={MAX_LEN.short}
          value={draft.person}
          onChange={(e) => setDraft({ ...draft, person: e.target.value })}
        />
      </div>

      <div className="md:col-span-2">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="field-label mb-0">質問と回答</span>
          <button
            type="button"
            className="btn-text disabled:pointer-events-none disabled:opacity-40"
            onClick={openPicker}
            disabled={templateLoading}
          >
            <CopyPlus size={14} strokeWidth={2.4} />
            テンプレートから質問を選ぶ
          </button>
        </div>

        {pickerOpen && (
          <TemplatePicker
            questions={templateQuestions}
            onAdd={addFromTemplate}
            onClose={() => setPickerOpen(false)}
          />
        )}

        {draft.qas.length === 0 && !pickerOpen && (
          <p className="mb-2 text-xs text-ink-faint">
            「テンプレートから質問を選ぶ」で聞くことリストから取り込むか、「質問を追加」で自由に追加できます。
          </p>
        )}

        <div className="flex flex-col gap-2">
          {draft.qas.map((qa, i) => (
            <div key={i} className="rounded-xl border border-line bg-white p-3">
              <div className="flex items-start gap-2">
                <span className="mt-2 w-7 shrink-0 text-xs font-bold text-ink-faint">
                  Q{i + 1}.
                </span>
                <input
                  type="text"
                  className="input"
                  placeholder="質問"
                  maxLength={MAX_LEN.question}
                  value={qa.question}
                  onChange={(e) => setQa(i, { question: e.target.value })}
                />
                <button
                  type="button"
                  className="icon-btn mt-0.5 shrink-0"
                  onClick={() => removeQa(i)}
                  aria-label="この質問を削除"
                >
                  <X size={14} />
                </button>
              </div>
              <textarea
                className="input mt-2 min-h-[64px] resize-y"
                placeholder="聞いた回答・話の内容"
                maxLength={MAX_LEN.answer}
                value={qa.answer}
                onChange={(e) => setQa(i, { answer: e.target.value })}
              />
            </div>
          ))}
        </div>
        <button type="button" className="btn-text mt-1.5" onClick={addQa}>
          <Plus size={13} strokeWidth={2.6} />
          質問を追加
        </button>
      </div>

      <div className="md:col-span-2">
        <label className="field-label">その他メモ</label>
        <textarea
          className="input min-h-[64px] resize-y"
          placeholder="質問に紐づかない気づき、会場の雰囲気など"
          maxLength={MAX_LEN.memo}
          value={draft.memo}
          onChange={(e) => setDraft({ ...draft, memo: e.target.value })}
        />
        <CharCount value={draft.memo} max={MAX_LEN.memo} />
      </div>
      <div className="md:col-span-2">
        <label className="field-label">選考に活かせそうなこと</label>
        <textarea
          className="input min-h-[64px] resize-y"
          placeholder="志望動機に使えそうな話、面接で触れたいエピソードなど"
          maxLength={MAX_LEN.memo}
          value={draft.insight}
          onChange={(e) => setDraft({ ...draft, insight: e.target.value })}
        />
        <CharCount value={draft.insight} max={MAX_LEN.memo} />
      </div>
      <div className="flex justify-end gap-2 md:col-span-2">
        <button type="button" className="btn-ghost" onClick={onCancel}>
          キャンセル
        </button>
        <button type="button" className="btn-primary" onClick={save}>
          保存する
        </button>
      </div>
    </div>
  )
}

function fmtVisitDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

/** 企業ごとのOB・OG訪問の記録タブ。訪問日ごとに、質問と回答のセットで記録を残せる */
export default function ObOgTab({ company }: { company: Company }) {
  const { updateCompany } = useCompanies()
  // アカウント共通のテンプレート。ここでは読み取り（質問のコピー元）としてだけ使う
  const {
    data: template,
    loading: templateLoading,
    error: templateError,
  } = useObOgPrep()
  const [editingId, setEditingId] = useState<string | 'new' | null>(null)
  // 開いている回答。訪問をまたいで管理するため「訪問id-質問index」をキーにする
  const [openQas, setOpenQas] = useState<Set<string>>(new Set())

  const toggleQa = (key: string) => {
    const next = new Set(openQas)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    setOpenQas(next)
  }

  const toVisit = (draft: VisitDraft, id: string): ObOgVisit => ({
    id,
    // 日付入力（YYYY-MM-DD）はローカルの0時としてISO文字列に変換して保存する
    date: new Date(`${draft.date}T00:00`).toISOString(),
    person: draft.person.trim(),
    qas: draft.qas,
    memo: draft.memo,
    insight: draft.insight,
  })

  const save = (draft: VisitDraft) => {
    if (editingId === 'new') {
      updateCompany(company.id, (c) => ({
        ...c,
        obogVisits: [...c.obogVisits, toVisit(draft, uid())],
      }))
    } else if (editingId) {
      updateCompany(company.id, (c) => ({
        ...c,
        obogVisits: c.obogVisits.map((v) => (v.id === editingId ? toVisit(draft, v.id) : v)),
      }))
    }
    setEditingId(null)
  }

  const remove = (visit: ObOgVisit) => {
    if (
      !window.confirm(
        `${fmtVisitDate(visit.date)}の訪問記録を削除しますか？この操作は取り消せません。`,
      )
    )
      return
    updateCompany(company.id, (c) => ({
      ...c,
      obogVisits: c.obogVisits.filter((v) => v.id !== visit.id),
    }))
  }

  // 新しい訪問が上に来るように日付の降順で表示する
  const visits = [...company.obogVisits].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )

  return (
    <>
      {/* 聞くことリストはアカウント共通のテンプレートなので、参照導線だけ置く */}
      <Link
        to="/ob-og-prep"
        className="mb-4 flex items-center gap-2 rounded-xl border border-dashed border-line-strong bg-brand-ghost px-4 py-2.5 text-sm font-semibold text-ink-sub transition hover:border-brand hover:text-brand"
      >
        <Users size={15} className="shrink-0 text-brand" />
        <span className="min-w-0 flex-1">
          聞くことリストは「OB・OG訪問テンプレート」で編集できます
        </span>
        <ChevronRight size={15} className="shrink-0" />
      </Link>

      <SectionCard
        title="OB・OG訪問の記録"
        count={company.obogVisits.length}
        action={
          <button type="button" className="btn-text" onClick={() => setEditingId('new')}>
            <Plus size={14} strokeWidth={2.6} />
            訪問を追加
          </button>
        }
      >
        {editingId === 'new' && (
          <VisitForm
            initial={emptyDraft()}
            templateQuestions={template.questions}
            templateLoading={templateLoading}
            templateError={templateError}
            onSave={save}
            onCancel={() => setEditingId(null)}
          />
        )}

        {company.obogVisits.length === 0 && editingId !== 'new' ? (
          <p className="py-2 text-sm text-ink-faint">
            訪問の記録はまだありません。「訪問を追加」から、テンプレートの質問を取り込んで訪問日ごとに回答を残せます。
          </p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {visits.map((v) => {
              if (editingId === v.id) {
                return (
                  <VisitForm
                    key={v.id}
                    initial={{
                      date: toInputDate(v.date),
                      person: v.person,
                      qas: v.qas,
                      memo: v.memo,
                      insight: v.insight,
                    }}
                    templateQuestions={template.questions}
                    templateLoading={templateLoading}
                    templateError={templateError}
                    onSave={save}
                    onCancel={() => setEditingId(null)}
                  />
                )
              }
              return (
                <div key={v.id} className="rounded-xl border border-line bg-white px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold">{fmtVisitDate(v.date)}</p>
                    {v.person && <span className="tag">{v.person}</span>}
                    <span className="ml-auto flex gap-1.5">
                      <button
                        type="button"
                        className="btn-text"
                        onClick={() => setEditingId(v.id)}
                      >
                        <Pencil size={13} />
                        編集
                      </button>
                      <button
                        type="button"
                        className="btn-text text-danger hover:bg-danger-soft"
                        onClick={() => remove(v)}
                      >
                        <Trash2 size={13} />
                        削除
                      </button>
                    </span>
                  </div>

                  {/* 質問は常に見え、回答はタップで開閉する（ES・面接対策と同じパターン） */}
                  {v.qas.length > 0 && (
                    <div className="mt-2.5 flex flex-col gap-1.5">
                      {v.qas.map((qa, i) => {
                        const key = `${v.id}-${i}`
                        const open = openQas.has(key)
                        return (
                          <div
                            key={key}
                            className="overflow-hidden rounded-xl border border-line bg-white"
                          >
                            <button
                              type="button"
                              className="flex w-full items-start gap-3 px-3.5 py-2.5 text-left transition hover:bg-brand-ghost"
                              onClick={() => toggleQa(key)}
                              aria-expanded={open}
                            >
                              <span className="min-w-0 flex-1 whitespace-pre-wrap break-words text-sm font-bold leading-relaxed">
                                Q{i + 1}. {qa.question}
                              </span>
                              <ChevronDown
                                size={15}
                                className={`mt-0.5 shrink-0 text-ink-faint transition ${open ? 'rotate-180' : ''}`}
                              />
                            </button>
                            {open && (
                              <div className="border-t border-line px-3.5 pb-3">
                                <div className="mt-2.5 whitespace-pre-wrap break-words rounded-xl bg-brand-ghost px-3 py-2.5 text-sm">
                                  {qa.answer || '（回答未記入）'}
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {v.memo && (
                    <div className="mt-2.5">
                      <p className="text-xs font-bold text-ink-faint">その他メモ</p>
                      <p className="mt-0.5 whitespace-pre-wrap break-words text-sm text-ink">
                        {v.memo}
                      </p>
                    </div>
                  )}
                  {v.insight && (
                    <div className="mt-2.5 rounded-lg bg-brand-ghost px-3 py-2">
                      <p className="text-xs font-bold text-brand">選考に活かせそうなこと</p>
                      <p className="mt-0.5 whitespace-pre-wrap break-words text-sm text-ink-sub">
                        {v.insight}
                      </p>
                    </div>
                  )}
                  {v.qas.length === 0 && !v.memo && !v.insight && (
                    <p className="mt-1.5 text-xs text-ink-faint">（メモ未記入）</p>
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
