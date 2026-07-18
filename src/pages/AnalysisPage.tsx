import { Lightbulb } from 'lucide-react'
import { useMemo } from 'react'
import EmptyState from '../components/common/EmptyState'
import LoadingState from '../components/common/LoadingState'
import SectionCard from '../components/common/SectionCard'
import { useCompanies } from '../hooks/useCompanies'
import {
  buildAdvice,
  industryStats,
  isClosedStatus,
  monthlyApplications,
  questionRanking,
  stageStats,
  tagRanking,
} from '../utils/analysis'

const pct = (rate: number) => `${Math.round(rate * 100)}%`

/** データが集まるまでの各セクション共通の案内文 */
function SectionHint({ children }: { children: string }) {
  return <p className="py-2 text-sm text-ink-faint">{children}</p>
}

/** 割合を示す横棒。値はすべてテキストでも併記するため、棒は補助表現 */
function RatioBar({
  segments,
}: {
  segments: { value: number; className: string; label: string }[]
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0)
  if (total === 0) return null
  return (
    <div className="flex h-2 w-full gap-0.5 overflow-hidden" role="presentation">
      {segments
        .filter((s) => s.value > 0)
        .map((s) => (
          <div
            key={s.label}
            className={`rounded-full ${s.className}`}
            style={{ width: `${(s.value / total) * 100}%` }}
            title={`${s.label} ${s.value}社`}
          />
        ))}
    </div>
  )
}

export default function AnalysisPage() {
  const { companies, loading } = useCompanies()

  const stages = useMemo(() => stageStats(companies), [companies])
  const industries = useMemo(() => industryStats(companies), [companies])
  const monthly = useMemo(() => monthlyApplications(companies), [companies])
  const tags = useMemo(() => tagRanking(companies), [companies])
  const questions = useMemo(() => questionRanking(companies), [companies])
  const advice = useMemo(() => buildAdvice(stages, tags), [stages, tags])

  if (loading) {
    return <LoadingState label="企業データを読み込み中…" />
  }

  if (companies.length === 0) {
    return (
      <div className="mx-auto max-w-3xl py-10">
        <EmptyState
          title="まだ分析できるデータがありません"
          description="企業を登録して選考を進めると、ここに通過率や敗因の傾向が表示されます。"
        />
      </div>
    )
  }

  const closedCount = companies.filter((c) => isClosedStatus(c.status)).length
  const visibleStages = stages.filter((s) => s.passed + s.failed + s.withdrawn > 0)
  const maxMonthly = Math.max(...monthly.months.map((m) => m.count), 1)
  const topQuestions = questions.slice(0, 10)
  const topTags = tags.slice(0, 10)

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-1 text-xl font-bold tracking-tight sm:text-2xl">選考の分析</h1>
      <p className="mb-5 text-sm text-ink-sub">
        登録した企業・振り返り・面接記録をもとに、これまでの選考の傾向をまとめています。
      </p>

      <SectionCard title="傾向からのアドバイス">
        <p className="mb-3 text-xs text-ink-faint">
          集計結果に対して、あらかじめ決めたルールで表示している一言です（AIによる分析ではありません）。
        </p>
        {advice.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {advice.map((a) => (
              <li
                key={a}
                className="flex items-start gap-2.5 rounded-xl bg-brand-ghost px-3.5 py-2.5 text-sm"
              >
                <Lightbulb size={16} className="mt-0.5 shrink-0 text-brand" />
                {a}
              </li>
            ))}
          </ul>
        ) : closedCount > 0 ? (
          <SectionHint>現時点で大きく偏った傾向は見られません。この調子で記録を続けましょう。</SectionHint>
        ) : (
          <SectionHint>選考の結果が出てくると、ここにアドバイスが表示されます。</SectionHint>
        )}
      </SectionCard>

      <SectionCard title="選考段階別の通過率">
        <p className="mb-3 text-xs text-ink-faint">
          振り返りタブで「落ちた選考ステップ」を選んだ企業が集計されます。同じ名前のステップは同じ段階として数えます。
        </p>
        {visibleStages.length === 0 ? (
          <SectionHint>選考が進むと、段階ごとの通過状況がここに表示されます。</SectionHint>
        ) : (
          <div className="flex flex-col gap-3.5">
            {visibleStages.map((s) => (
              <div key={s.label}>
                <div className="mb-1 flex flex-wrap items-baseline gap-x-3 gap-y-0.5 text-sm">
                  <span className="font-bold">{s.label}</span>
                  <span className="text-xs text-ink-sub">
                    通過 {s.passed}社 ／ 落選 {s.failed}社
                    {s.withdrawn > 0 && ` ／ 辞退 ${s.withdrawn}社`}
                  </span>
                  <span className="ml-auto text-xs font-bold text-ink-sub">
                    {s.passRate !== null ? `通過率 ${pct(s.passRate)}` : '通過率 —'}
                  </span>
                </div>
                <RatioBar
                  segments={[
                    { value: s.passed, className: 'bg-success', label: '通過' },
                    { value: s.failed, className: 'bg-danger', label: '落選' },
                    { value: s.withdrawn, className: 'bg-line-strong', label: '辞退' },
                  ]}
                />
              </div>
            ))}
            <p className="text-xs text-ink-faint">
              ■ 緑：通過 ／ ■ 赤：落選 ／ ■ 灰：辞退（通過率は 通過÷(通過+落選)。辞退は含みません）
            </p>
          </div>
        )}
      </SectionCard>

      <SectionCard title="業界別の状況">
        {industries.length === 0 ? (
          <SectionHint>企業を登録すると、業界ごとの進み具合がここに表示されます。</SectionHint>
        ) : (
          <div className="flex flex-col gap-3.5">
            {industries.map((ind) => (
              <div key={ind.industry}>
                <div className="mb-1 flex flex-wrap items-baseline gap-x-3 gap-y-0.5 text-sm">
                  <span className="font-bold">{ind.industry}</span>
                  <span className="text-xs text-ink-sub">
                    {ind.total}社（内定 {ind.offers} ／ 不合格 {ind.failed} ／ 辞退 {ind.withdrawn} ／
                    選考中 {ind.active}）
                  </span>
                  {ind.failRate !== null && (
                    <span className="ml-auto text-xs font-bold text-ink-sub">
                      不合格率 {pct(ind.failRate)}
                    </span>
                  )}
                </div>
                <RatioBar
                  segments={[
                    { value: ind.offers, className: 'bg-success', label: '内定' },
                    { value: ind.failed, className: 'bg-danger', label: '不合格' },
                    { value: ind.withdrawn, className: 'bg-line-strong', label: '辞退' },
                    { value: ind.active, className: 'bg-brand', label: '選考中' },
                  ]}
                />
              </div>
            ))}
            <p className="text-xs text-ink-faint">
              ■ 緑：内定 ／ ■ 赤：不合格 ／ ■ 灰：辞退 ／ ■ 青：選考中（不合格率は結果が出た企業の中での割合）
            </p>
          </div>
        )}
      </SectionCard>

      <SectionCard title="月別の応募数">
        {monthly.months.length === 0 ? (
          <SectionHint>企業の登録が増えると、月ごとの応募数の推移がここに表示されます。</SectionHint>
        ) : (
          <div className="flex flex-col gap-2">
            {monthly.months.map((m) => (
              <div key={m.key} className="flex items-center gap-3 text-sm">
                <span className="w-24 shrink-0 text-xs font-bold text-ink-sub">{m.label}</span>
                <div className="h-2 flex-1">
                  {m.count > 0 && (
                    <div
                      className="h-full rounded-full bg-brand"
                      style={{ width: `${(m.count / maxMonthly) * 100}%` }}
                    />
                  )}
                </div>
                <span className="w-10 shrink-0 text-right text-xs font-bold">{m.count}社</span>
              </div>
            ))}
            {monthly.unknown > 0 && (
              <p className="mt-1 text-xs text-ink-faint">
                ほかに登録時期が分からない企業が{monthly.unknown}社あります（このフィールドの追加前に登録され、予定も無い企業）。
              </p>
            )}
          </div>
        )}
      </SectionCard>

      <SectionCard title="敗因タグの集計">
        {topTags.length === 0 ? (
          <SectionHint>
            振り返りタブで敗因タグを記録すると、頻度の高い順にここに表示されます。
          </SectionHint>
        ) : (
          <div className="flex flex-col gap-2">
            {topTags.map((t, i) => (
              <div key={t.tag} className="flex items-center gap-3 text-sm">
                <span className="w-6 shrink-0 text-center text-xs font-bold text-ink-faint">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1 truncate font-semibold">{t.tag}</span>
                <div className="hidden h-2 w-32 shrink-0 sm:block">
                  <div
                    className="h-full rounded-full bg-danger"
                    style={{ width: `${(t.count / topTags[0].count) * 100}%` }}
                  />
                </div>
                <span className="w-10 shrink-0 text-right text-xs font-bold">{t.count}回</span>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard title="面接でよく聞かれた質問">
        <p className="mb-3 text-xs text-ink-faint">
          面接記録の質問と、各企業の面接対策に登録した質問を、単純な出現回数で集計しています。
        </p>
        {topQuestions.length === 0 ? (
          <SectionHint>面接の記録が増えると、よく聞かれる質問の傾向がここに表示されます。</SectionHint>
        ) : (
          <div className="flex flex-col gap-2">
            {topQuestions.map((q, i) => (
              <div key={q.question} className="flex items-baseline gap-3 text-sm">
                <span className="w-6 shrink-0 text-center text-xs font-bold text-ink-faint">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1 break-words">{q.question}</span>
                <span className="shrink-0 text-xs font-bold text-ink-sub">{q.count}回</span>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  )
}
