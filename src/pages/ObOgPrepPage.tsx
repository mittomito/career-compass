import { Check, Pencil, Plus, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import LoadErrorState from '../components/common/LoadErrorState'
import LoadingState from '../components/common/LoadingState'
import SectionCard from '../components/common/SectionCard'
import CharCount from '../components/common/CharCount'
import { MAX_LEN } from '../data/constants'
import { useObOgPrep } from '../hooks/useObOgPrep'
import { uid } from '../utils/id'

export default function ObOgPrepPage() {
  const { data, loading, error, retry, update } = useObOgPrep()
  const [adding, setAdding] = useState(false)
  const [newText, setNewText] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [memoEditing, setMemoEditing] = useState(false)
  const [memoDraft, setMemoDraft] = useState('')

  if (loading) {
    return <LoadingState label="OB・OG訪問テンプレートを読み込み中…" />
  }

  if (error) {
    return <LoadErrorState title="OB・OG訪問テンプレートの読み込みに失敗しました" onRetry={retry} />
  }

  const addQuestion = () => {
    const text = newText.trim()
    if (!text) return
    update((d) => ({ ...d, questions: [...d.questions, { id: uid(), text }] }))
    setNewText('')
    setAdding(false)
  }

  const saveEdit = (id: string) => {
    const text = editText.trim()
    if (!text) return
    update((d) => ({
      ...d,
      questions: d.questions.map((q) => (q.id === id ? { ...q, text } : q)),
    }))
    setEditingId(null)
  }

  const removeQuestion = (id: string) => {
    update((d) => ({ ...d, questions: d.questions.filter((q) => q.id !== id) }))
  }

  const saveMemo = () => {
    update((d) => ({ ...d, memo: memoDraft }))
    setMemoEditing(false)
  }

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-1 text-xl font-extrabold">OB・OG訪問テンプレート</h1>
      <p className="mb-6 text-sm text-ink-sub">
        OB・OG訪問で聞くことを事前に整理しておくノートです。どの企業の訪問でも使い回せる「聞くことリスト」と汎用メモをここにまとめておき、実際に聞いた内容は各企業詳細の「OB・OG訪問」タブに記録できます。
      </p>

      <SectionCard
        title="聞くことリスト"
        count={data.questions.length}
        action={
          <button type="button" className="btn-text" onClick={() => setAdding((v) => !v)}>
            <Plus size={14} strokeWidth={2.6} />
            質問を追加
          </button>
        }
      >
        {adding && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-line bg-brand-ghost p-3">
            <input
              type="text"
              className="input"
              placeholder="例：この会社で身につく力は何だと思いますか？"
              maxLength={MAX_LEN.question}
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addQuestion()}
              autoFocus
            />
            <button type="button" className="btn-primary shrink-0" onClick={addQuestion}>
              追加
            </button>
          </div>
        )}

        {data.questions.length === 0 && !adding ? (
          <p className="py-2 text-sm text-ink-faint">
            質問はまだ登録されていません。「質問を追加」から作成できます。
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {data.questions.map((q, i) => (
              <li
                key={q.id}
                className="flex items-center gap-2.5 rounded-xl border border-line bg-white px-4 py-2.5"
              >
                {editingId === q.id ? (
                  <>
                    <input
                      type="text"
                      className="input"
                      maxLength={MAX_LEN.question}
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && saveEdit(q.id)}
                      autoFocus
                    />
                    <button
                      type="button"
                      className="icon-btn shrink-0"
                      onClick={() => saveEdit(q.id)}
                      aria-label="保存"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      type="button"
                      className="icon-btn shrink-0"
                      onClick={() => setEditingId(null)}
                      aria-label="キャンセル"
                    >
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="w-6 shrink-0 text-xs font-bold text-ink-faint">{i + 1}.</span>
                    <span className="min-w-0 flex-1 break-words text-sm">{q.text}</span>
                    <button
                      type="button"
                      className="icon-btn shrink-0"
                      onClick={() => {
                        setEditingId(q.id)
                        setEditText(q.text)
                      }}
                      aria-label="この質問を編集"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      type="button"
                      className="icon-btn shrink-0 hover:border-danger hover:bg-danger-soft hover:text-danger"
                      onClick={() => removeQuestion(q.id)}
                      aria-label="この質問を削除"
                    >
                      <Trash2 size={13} />
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <SectionCard
        title="汎用メモ"
        action={
          !memoEditing ? (
            <button
              type="button"
              className="btn-text"
              onClick={() => {
                setMemoDraft(data.memo)
                setMemoEditing(true)
              }}
            >
              <Pencil size={14} />
              編集
            </button>
          ) : undefined
        }
      >
        {memoEditing ? (
          <>
            <textarea
              className="input min-h-[120px] resize-y"
              placeholder="訪問前の準備、依頼メールの文面、当日のマナーの注意点など"
              maxLength={MAX_LEN.memo}
              value={memoDraft}
              onChange={(e) => setMemoDraft(e.target.value)}
            />
            <CharCount value={memoDraft} max={MAX_LEN.memo} />
            <div className="mt-3 flex justify-end gap-2">
              <button type="button" className="btn-ghost" onClick={() => setMemoEditing(false)}>
                キャンセル
              </button>
              <button type="button" className="btn-primary" onClick={saveMemo}>
                保存する
              </button>
            </div>
          </>
        ) : data.memo ? (
          <p className="whitespace-pre-wrap break-words text-sm">{data.memo}</p>
        ) : (
          <p className="py-2 text-sm text-ink-faint">
            訪問前の準備や当日の注意点など、企業をまたいで使うメモを残せます。
          </p>
        )}
      </SectionCard>
    </div>
  )
}
