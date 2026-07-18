import { Plus } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { REJECTION_TAG_PRESETS } from '../../data/constants'
import { useCompanies } from '../../hooks/useCompanies'
import type { Company } from '../../types'
import { uid } from '../../utils/id'
import SectionCard from '../common/SectionCard'

/** 連続入力をまとめて保存するまでの待ち時間（企業研究タブと同じ運用） */
const SAVE_DEBOUNCE_MS = 500

/**
 * フローに登録していなくても「落ちたステップ」として直接選べるステップ。
 * 選択すると同時にフローへ追加する（分析ページがフロー上の位置で集計するため、
 * フロー外の値を rejectedStepId に持たせない）。
 */
const EXTRA_STEP_PRESETS = ['GD', '動画'] as const

/** フロー外プリセットの option 値の接頭辞（既存ステップの id と区別する） */
const PRESET_PREFIX = 'preset:'

/**
 * 選考の振り返り入力欄。ステータスに関わらず常に表示し、
 * どのステップで終わったか・敗因タグ・振り返りメモ（既存の rejectionMemo）を記録する。
 */
export default function RejectionReflectionSection({ company }: { company: Company }) {
  const { companies, updateCompany } = useCompanies()
  const [newTag, setNewTag] = useState('')

  // フロー編集でステップが削除され rejectedStepId が残った場合は「未選択」扱いにする
  const selectedStepId = company.flow.some((s) => s.id === company.rejectedStepId)
    ? company.rejectedStepId
    : null

  // プリセットに加え、他の企業で使った自由入力タグも候補として並べる
  // （企業研究のカスタムカテゴリと同様、一度作ったタグを再利用しやすくする）
  const tagOptions = useMemo(() => {
    const options = [...REJECTION_TAG_PRESETS] as string[]
    for (const c of companies) {
      for (const tag of c.rejectionTags) {
        if (!options.includes(tag)) options.push(tag)
      }
    }
    return options
  }, [companies])

  // メモはローカル draft に即時反映し、Firestore への保存はデバウンスでまとめる
  const [memo, setMemo] = useState(company.rejectionMemo)
  const memoRef = useRef(memo)
  const dirtyRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const updateCompanyRef = useRef(updateCompany)
  updateCompanyRef.current = updateCompany

  const flush = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    if (!dirtyRef.current) return
    dirtyRef.current = false
    updateCompanyRef.current(company.id, (c) => ({ ...c, rejectionMemo: memoRef.current }))
  }
  const flushRef = useRef(flush)
  flushRef.current = flush

  // タブ切替などでアンマウントされるとき、未保存の入力を確実に書き込む
  useEffect(() => {
    return () => flushRef.current()
  }, [])

  const changeMemo = (value: string) => {
    memoRef.current = value
    setMemo(value)
    dirtyRef.current = true
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => flushRef.current(), SAVE_DEBOUNCE_MS)
  }

  // フローに無いプリセット（GD・動画）だけを選択肢に出す（ラベルの重複を避ける）
  const missingPresets = EXTRA_STEP_PRESETS.filter(
    (p) => !company.flow.some((s) => s.label.trim() === p),
  )

  const changeStep = (value: string) => {
    if (value.startsWith(PRESET_PREFIX)) {
      const step = { id: uid(), label: value.slice(PRESET_PREFIX.length) }
      updateCompany(company.id, (c) => ({
        ...c,
        flow: [...c.flow, step],
        rejectedStepId: step.id,
      }))
      return
    }
    updateCompany(company.id, (c) => ({ ...c, rejectedStepId: value || null }))
  }

  const toggleTag = (tag: string) => {
    updateCompany(company.id, (c) => ({
      ...c,
      rejectionTags: c.rejectionTags.includes(tag)
        ? c.rejectionTags.filter((t) => t !== tag)
        : [...c.rejectionTags, tag],
    }))
  }

  const addTag = () => {
    const tag = newTag.trim()
    if (!tag) return
    updateCompany(company.id, (c) => ({
      ...c,
      rejectionTags: c.rejectionTags.includes(tag) ? c.rejectionTags : [...c.rejectionTags, tag],
    }))
    setNewTag('')
  }

  // 選考中の企業でも常に表示するため、ステータスに合わせてラベルを切り替える
  const stepLabel =
    company.status === '辞退'
      ? '辞退した選考ステップ'
      : company.status === '不合格'
        ? '落ちた選考ステップ'
        : '終了した選考ステップ'

  return (
    <SectionCard title="選考の振り返り">
      <p className="mb-4 text-xs text-ink-faint">
        どこまで進んで・なぜ終わったのかを記録しておくと、分析ページで傾向を振り返れます。入力内容は自動で保存されます。
      </p>
      <div className="flex flex-col gap-4">
        <div className="max-w-[320px]">
          <label className="field-label">{stepLabel}</label>
          <select
            className="input"
            value={selectedStepId ?? ''}
            onChange={(e) => changeStep(e.target.value)}
          >
            <option value="">未選択</option>
            {company.flow.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
            {missingPresets.length > 0 && (
              <optgroup label="フローに追加して選択">
                {missingPresets.map((p) => (
                  <option key={p} value={`${PRESET_PREFIX}${p}`}>
                    {p}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
          <p className="mt-1 text-xs text-ink-faint">
            {company.flow.length === 0
              ? '選考タブでフローを登録すると、ここでステップを選べます。GD・動画はそのまま選べます（選ぶとフローにも追加されます）。'
              : 'フローに無いGD・動画を選ぶと、選考フローにも自動で追加されます。'}
          </p>
        </div>

        <div>
          <span className="field-label">敗因タグ（複数選択可）</span>
          <div className="flex flex-wrap gap-2">
            {tagOptions.map((tag) => {
              const selected = company.rejectionTags.includes(tag)
              return (
                <button
                  key={tag}
                  type="button"
                  className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                    selected
                      ? 'border-brand bg-brand-soft text-brand'
                      : 'border-line-strong bg-white text-ink-sub hover:border-brand hover:text-brand'
                  }`}
                  onClick={() => toggleTag(tag)}
                  aria-pressed={selected}
                >
                  {tag}
                </button>
              )
            })}
          </div>
          <div className="mt-2.5 flex max-w-[320px] items-center gap-2">
            <input
              type="text"
              className="input flex-1"
              placeholder="タグを追加（例：逆質問）"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTag()}
            />
            <button
              type="button"
              className="btn-ghost shrink-0"
              onClick={addTag}
              disabled={!newTag.trim()}
            >
              <Plus size={14} strokeWidth={2.6} />
              追加
            </button>
          </div>
        </div>

        <div>
          <label className="field-label">振り返りメモ</label>
          <textarea
            className="input min-h-[90px] resize-y"
            placeholder="どの段階で・なぜ通らなかったか、次に活かせることなど"
            value={memo}
            onChange={(e) => changeMemo(e.target.value)}
          />
        </div>
      </div>
    </SectionCard>
  )
}
