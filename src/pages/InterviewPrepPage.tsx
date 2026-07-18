import LoadErrorState from '../components/common/LoadErrorState'
import LoadingState from '../components/common/LoadingState'
import PrepTreeSection from '../components/prep/PrepTreeSection'
import { useInterviewPrep } from '../hooks/useInterviewPrep'

export default function InterviewPrepPage() {
  const { nodes, loading, error, retry, updateNodes } = useInterviewPrep()

  if (loading) {
    return <LoadingState label="面接対策テンプレートを読み込み中…" />
  }

  if (error) {
    return <LoadErrorState title="面接対策テンプレートの読み込みに失敗しました" onRetry={retry} />
  }

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-1 text-xl font-extrabold">面接対策テンプレート</h1>
      <p className="mb-6 text-sm text-ink-sub">
        面接でよく聞かれる質問と自分の回答を整理しておくノートです。質問をタップすると回答が開きます。「深掘りを追加」で、面接官に突っ込まれそうな質問をぶら下げて、深掘りの流れを事前に想定しておけます。企業ごとの対策は、各企業詳細の「面接対策」タブにテンプレートをコピーして育てられます。
      </p>
      <PrepTreeSection nodes={nodes} updateNodes={updateNodes} />
    </div>
  )
}
