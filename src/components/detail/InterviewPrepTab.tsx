import { ChevronRight, CopyPlus, MessagesSquare } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCompanies } from '../../hooks/useCompanies'
import { useInterviewPrep } from '../../hooks/useInterviewPrep'
import type { Company, PrepNode } from '../../types'
import { clonePrepNodes } from '../../utils/prepTree'
import PrepTreeSection from '../prep/PrepTreeSection'

export default function InterviewPrepTab({ company }: { company: Company }) {
  const { updateCompany } = useCompanies()
  // アカウント共通のテンプレート。ここでは読み取り（コピー元）としてだけ使う
  const { nodes: templateNodes, loading: templateLoading, error: templateError } = useInterviewPrep()

  const updateNodes = (updater: (nodes: PrepNode[]) => PrepNode[]) => {
    updateCompany(company.id, (c) => ({ ...c, prepNodes: updater(c.prepNodes) }))
  }

  const copyTemplate = () => {
    // 読み込み失敗中は「テンプレートが空」と誤認させないよう、専用の案内を出す
    if (templateError) {
      alert('面接対策テンプレートの読み込みに失敗しています。ページを再読み込みしてからお試しください。')
      return
    }
    if (templateNodes.length === 0) {
      alert(
        '面接対策テンプレートに質問が登録されていません。ヘッダーの「面接対策」からテンプレートを作成できます。',
      )
      return
    }
    // 上書きはせず末尾への追記にする（企業側で育てた対策を失わないため）。
    // ただし既存データがある場合は、二重コピーの事故を防ぐため確認を挟む
    if (company.prepNodes.length > 0) {
      if (
        !window.confirm(
          `テンプレートの質問 ${templateNodes.length}件をこの企業の面接対策に追加しますか？\n既存の質問 ${company.prepNodes.length}件はそのまま残ります。`,
        )
      )
        return
    }
    updateNodes((ns) => [...ns, ...clonePrepNodes(templateNodes)])
  }

  return (
    <>
      {/* テンプレートはアカウント共通のノートなので、企業データには含めず参照導線だけ置く */}
      <Link
        to="/interview-prep"
        className="mb-4 flex items-center gap-2 rounded-xl border border-dashed border-line-strong bg-brand-ghost px-4 py-2.5 text-sm font-semibold text-ink-sub transition hover:border-brand hover:text-brand"
      >
        <MessagesSquare size={15} className="shrink-0 text-brand" />
        <span className="min-w-0 flex-1">共通の想定質問は「面接対策テンプレート」で編集できます</span>
        <ChevronRight size={15} className="shrink-0" />
      </Link>
      <PrepTreeSection
        nodes={company.prepNodes}
        updateNodes={updateNodes}
        extraAction={
          <button
            type="button"
            className="btn-text disabled:pointer-events-none disabled:opacity-40"
            onClick={copyTemplate}
            disabled={templateLoading}
          >
            <CopyPlus size={14} strokeWidth={2.4} />
            テンプレートをコピー
          </button>
        }
        emptyText="質問はまだありません。「テンプレートをコピー」で共通の想定質問を取り込むか、「質問を追加」から作成できます。"
      />
    </>
  )
}
