import { ChevronDown, ChevronRight, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState, type Dispatch, type ReactNode, type SetStateAction } from 'react'
import type { PrepNode } from '../../types'
import { uid } from '../../utils/id'
import { childrenOf, collectDescendantIds, removeWithDescendants } from '../../utils/prepTree'
import SectionCard from '../common/SectionCard'

interface PrepDraft {
  question: string
  answer: string
}

// ルート質問の追加中を表す番兵値（ノード id は UUID なので衝突しない）
const ROOT = 'root'

// 階層が深くなってもカード 1 枚の幅は一定に保ち、ツリー全体は横スクロールで見る
const CARD_WIDTH = 'w-[300px]'

function NodeForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: PrepDraft
  onSave: (draft: PrepDraft) => void
  onCancel: () => void
}) {
  const [draft, setDraft] = useState<PrepDraft>(initial)

  return (
    <div className={`${CARD_WIDTH} rounded-xl border border-line bg-brand-ghost p-3`}>
      <div className="mb-3">
        <label className="field-label">質問 *</label>
        <textarea
          className="input min-h-[52px] resize-y"
          placeholder="例：なぜそう考えたのですか？"
          value={draft.question}
          onChange={(e) => setDraft({ ...draft, question: e.target.value })}
        />
      </div>
      <div>
        <label className="field-label">回答</label>
        <textarea
          className="input min-h-[100px] resize-y"
          placeholder="想定している自分の回答"
          value={draft.answer}
          onChange={(e) => setDraft({ ...draft, answer: e.target.value })}
        />
      </div>
      <div className="mt-3 flex justify-end gap-2">
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

// ツリー全体で共有する状態と操作。再帰の各ノードへ 1 つの props として渡す
interface TreeCtx {
  nodes: PrepNode[]
  openAnswers: Set<string>
  openChildren: Set<string>
  editingId: string | null
  addingChildOf: string | null
  toggleAnswer: (id: string) => void
  toggleChildren: (id: string) => void
  startEdit: (id: string) => void
  startAddChild: (id: string) => void
  cancelForm: () => void
  saveEdit: (id: string, draft: PrepDraft) => void
  addChild: (parentId: string | null, draft: PrepDraft) => void
  removeNode: (node: PrepNode) => void
}

function NodeItem({ node, ctx }: { node: PrepNode; ctx: TreeCtx }) {
  const kids = childrenOf(ctx.nodes, node.id)
  const answerOpen = ctx.openAnswers.has(node.id)
  const childrenOpen = ctx.openChildren.has(node.id)
  const adding = ctx.addingChildOf === node.id

  return (
    <div className="flex flex-col gap-2.5">
      {ctx.editingId === node.id ? (
        <NodeForm
          initial={{ question: node.question, answer: node.answer }}
          onSave={(draft) => ctx.saveEdit(node.id, draft)}
          onCancel={ctx.cancelForm}
        />
      ) : (
        <div className={`${CARD_WIDTH} overflow-hidden rounded-xl border border-line bg-white`}>
          <button
            type="button"
            className="flex w-full items-start gap-2 px-3.5 py-2.5 text-left transition hover:bg-brand-ghost"
            onClick={() => ctx.toggleAnswer(node.id)}
            aria-expanded={answerOpen}
          >
            <span className="min-w-0 flex-1 whitespace-pre-wrap break-words text-sm font-bold leading-relaxed">
              {node.question}
            </span>
            <ChevronDown
              size={14}
              className={`mt-1 shrink-0 text-ink-faint transition ${answerOpen ? 'rotate-180' : ''}`}
            />
          </button>
          {answerOpen && (
            <div className="border-t border-line px-3.5 pb-3 pt-2.5">
              <p className="text-[11px] font-extrabold tracking-widest text-ink-faint">回答</p>
              <p className="mt-1 whitespace-pre-wrap break-words text-sm">
                {node.answer || '（未記入）'}
              </p>
              <div className="mt-2.5 flex justify-end gap-1.5">
                <button
                  type="button"
                  className="btn-text px-1.5 text-xs"
                  onClick={() => ctx.startEdit(node.id)}
                >
                  <Pencil size={12} />
                  編集
                </button>
                <button
                  type="button"
                  className="btn-text px-1.5 text-xs text-danger hover:bg-danger-soft"
                  onClick={() => ctx.removeNode(node)}
                >
                  <Trash2 size={12} />
                  削除
                </button>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between border-t border-line bg-paper px-2 py-1">
            {kids.length > 0 ? (
              <button
                type="button"
                className="btn-text px-1.5 py-0.5 text-xs text-ink-sub hover:bg-brand-ghost hover:text-ink"
                onClick={() => ctx.toggleChildren(node.id)}
                aria-expanded={childrenOpen}
              >
                <ChevronRight
                  size={12}
                  className={`transition ${childrenOpen ? 'rotate-90' : ''}`}
                />
                深掘り {kids.length}件
              </button>
            ) : (
              <span />
            )}
            <button
              type="button"
              className="btn-text px-1.5 py-0.5 text-xs"
              onClick={() => ctx.startAddChild(node.id)}
            >
              <Plus size={12} strokeWidth={2.6} />
              深掘りを追加
            </button>
          </div>
        </div>
      )}

      {((childrenOpen && kids.length > 0) || adding) && (
        <div className="ml-5 flex flex-col gap-2.5 border-l-2 border-line pl-4">
          {childrenOpen && kids.map((k) => <NodeItem key={k.id} node={k} ctx={ctx} />)}
          {adding && (
            <NodeForm
              initial={{ question: '', answer: '' }}
              onSave={(draft) => ctx.addChild(node.id, draft)}
              onCancel={ctx.cancelForm}
            />
          )}
        </div>
      )}
    </div>
  )
}

/**
 * 深掘り質問ツリーのセクション。アカウント共通のテンプレート（/interview-prep）と
 * 企業ごとの面接対策タブの両方から、同じ操作感・見た目で使う。
 */
export default function PrepTreeSection({
  nodes,
  updateNodes,
  extraAction,
  emptyText = '質問はまだありません。「質問を追加」から作成できます。',
}: {
  nodes: PrepNode[]
  updateNodes: (updater: (nodes: PrepNode[]) => PrepNode[]) => void
  /** 「質問を追加」の左に置く追加アクション（テンプレートのコピーなど） */
  extraAction?: ReactNode
  emptyText?: string
}) {
  const [openAnswers, setOpenAnswers] = useState<Set<string>>(new Set())
  const [openChildren, setOpenChildren] = useState<Set<string>>(new Set())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [addingChildOf, setAddingChildOf] = useState<string | null>(null)

  const toggleIn = (setter: Dispatch<SetStateAction<Set<string>>>) => (id: string) =>
    setter((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const saveEdit = (id: string, draft: PrepDraft) => {
    updateNodes((ns) =>
      ns.map((n) => (n.id === id ? { ...n, question: draft.question.trim(), answer: draft.answer } : n)),
    )
    setEditingId(null)
  }

  const addChild = (parentId: string | null, draft: PrepDraft) => {
    updateNodes((ns) => [
      ...ns,
      { id: uid(), parentId, question: draft.question.trim(), answer: draft.answer },
    ])
    setAddingChildOf(null)
    // 追加した深掘りがすぐ見えるよう、親を展開しておく
    if (parentId) setOpenChildren((prev) => new Set(prev).add(parentId))
  }

  const removeNode = (node: PrepNode) => {
    const descendants = collectDescendantIds(nodes, node.id)
    // 深掘りを巻き込む削除だけ確認を挟む。子のない質問は都度確認せず消せるようにする
    if (descendants.length > 0) {
      const head = node.question.length > 20 ? `${node.question.slice(0, 20)}…` : node.question
      if (
        !window.confirm(
          `「${head}」を削除しますか？\nこの質問にぶら下がっている深掘り質問 ${descendants.length}件もまとめて削除されます。この操作は取り消せません。`,
        )
      )
        return
    }
    updateNodes((ns) => removeWithDescendants(ns, node.id))
  }

  const ctx: TreeCtx = {
    nodes,
    openAnswers,
    openChildren,
    editingId,
    addingChildOf,
    toggleAnswer: toggleIn(setOpenAnswers),
    toggleChildren: toggleIn(setOpenChildren),
    startEdit: (id) => {
      setEditingId(id)
      setAddingChildOf(null)
    },
    startAddChild: (id) => {
      setAddingChildOf(id)
      setEditingId(null)
    },
    cancelForm: () => {
      setEditingId(null)
      setAddingChildOf(null)
    },
    saveEdit,
    addChild,
    removeNode,
  }

  const roots = childrenOf(nodes, null)

  return (
    <SectionCard
      title="想定質問と深掘り"
      count={nodes.length}
      action={
        <div className="flex items-center gap-1.5">
          {extraAction}
          <button type="button" className="btn-text" onClick={() => ctx.startAddChild(ROOT)}>
            <Plus size={14} strokeWidth={2.6} />
            質問を追加
          </button>
        </div>
      }
    >
      {addingChildOf === ROOT && (
        <div className="mb-4">
          <NodeForm
            initial={{ question: '', answer: '' }}
            onSave={(draft) => addChild(null, draft)}
            onCancel={ctx.cancelForm}
          />
        </div>
      )}

      {roots.length === 0 && addingChildOf !== ROOT ? (
        <p className="py-2 text-sm text-ink-faint">{emptyText}</p>
      ) : (
        // 階層が深くなった分は右へ伸ばし、横スクロールで見る
        <div className="-mx-2 overflow-x-auto px-2 pb-1">
          <div className="flex w-max min-w-full flex-col gap-3">
            {roots.map((r) => (
              <NodeItem key={r.id} node={r} ctx={ctx} />
            ))}
          </div>
        </div>
      )}
    </SectionCard>
  )
}
