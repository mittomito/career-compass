import { ArrowDown, ArrowUp, Check, Plus, Settings2, Trash2 } from 'lucide-react'
import { Fragment, useState } from 'react'
import { FLOW_PRESETS } from '../../data/constants'
import { useCompanies } from '../../hooks/useCompanies'
import type { Company } from '../../types'
import { uid } from '../../utils/id'
import SectionCard from '../common/SectionCard'

export default function FlowEditor({ company }: { company: Company }) {
  const { updateCompany } = useCompanies()
  const [editing, setEditing] = useState(false)
  const [newLabel, setNewLabel] = useState('')

  const currentIndex = company.flow.findIndex((s) => s.id === company.currentStepId)

  const setCurrent = (id: string) =>
    updateCompany(company.id, (c) => ({ ...c, currentStepId: id }))

  const addStep = () => {
    const label = newLabel.trim()
    if (!label) return
    updateCompany(company.id, (c) => ({ ...c, flow: [...c.flow, { id: uid(), label }] }))
    setNewLabel('')
  }

  const removeStep = (id: string) => {
    updateCompany(company.id, (c) => {
      const removedIndex = c.flow.findIndex((s) => s.id === id)
      const flow = c.flow.filter((s) => s.id !== id)
      let currentStepId = c.currentStepId
      if (c.currentStepId === id) {
        const fallback = flow[Math.min(removedIndex, flow.length - 1)]
        currentStepId = fallback ? fallback.id : null
      }
      return { ...c, flow, currentStepId }
    })
  }

  const moveStep = (id: string, dir: -1 | 1) => {
    updateCompany(company.id, (c) => {
      const i = c.flow.findIndex((s) => s.id === id)
      const j = i + dir
      if (i < 0 || j < 0 || j >= c.flow.length) return c
      const flow = [...c.flow]
      ;[flow[i], flow[j]] = [flow[j], flow[i]]
      return { ...c, flow }
    })
  }

  return (
    <SectionCard
      title="選考フロー"
      action={
        <button
          type="button"
          className={editing ? 'btn-primary' : 'btn-text'}
          onClick={() => setEditing(!editing)}
        >
          {editing ? (
            '編集を終了'
          ) : (
            <>
              <Settings2 size={14} />
              フローを編集
            </>
          )}
        </button>
      }
    >
      {company.flow.length === 0 ? (
        <p className="py-2 text-sm text-ink-faint">
          ステップがありません。「フローを編集」から追加してください。
        </p>
      ) : (
        <>
          <div className="flex items-start overflow-x-auto px-1 pb-3 pt-1.5">
            {company.flow.map((step, i) => {
              const done = currentIndex >= 0 && i < currentIndex
              const now = i === currentIndex
              return (
                <Fragment key={step.id}>
                  {i > 0 && (
                    <div
                      className={`mt-[17px] h-0.5 min-w-6 flex-1 rounded ${
                        currentIndex >= 0 && i <= currentIndex ? 'bg-brand' : 'bg-line-strong'
                      }`}
                    />
                  )}
                  <button
                    type="button"
                    className="group flex w-[92px] shrink-0 flex-col items-center"
                    onClick={() => setCurrent(step.id)}
                    title="このステップを現在地にする"
                  >
                    <span
                      className={`flex h-[34px] w-[34px] items-center justify-center rounded-full border-[2.5px] text-[13px] font-extrabold transition ${
                        done
                          ? 'border-brand bg-brand text-white'
                          : now
                            ? 'border-brand bg-white text-brand ring-[5px] ring-brand-soft'
                            : 'border-line-strong bg-white text-ink-faint group-hover:border-brand group-hover:text-brand'
                      }`}
                    >
                      {done ? <Check size={16} strokeWidth={3} /> : i + 1}
                    </span>
                    <span
                      className={`mt-2 text-center text-xs font-bold leading-snug ${
                        now ? 'text-brand' : done ? 'text-ink-sub' : 'text-ink-faint'
                      }`}
                    >
                      {step.label}
                    </span>
                    {now && (
                      <span className="mt-1 rounded-full bg-brand-soft px-2 text-[10px] font-extrabold text-brand">
                        いまここ
                      </span>
                    )}
                  </button>
                </Fragment>
              )
            })}
          </div>
          <p className="text-xs text-ink-faint">ステップをクリックすると現在地を変更できます。</p>
        </>
      )}

      {editing && (
        <div className="mt-4 rounded-xl border border-line bg-brand-ghost p-4">
          <div className="flex flex-col gap-2">
            {company.flow.map((step, i) => (
              <div
                key={step.id}
                className="flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-2"
              >
                <span className="w-6 text-center text-xs font-bold text-ink-faint">{i + 1}</span>
                <span className="flex-1 text-sm font-bold">{step.label}</span>
                <button
                  type="button"
                  className="icon-btn"
                  disabled={i === 0}
                  onClick={() => moveStep(step.id, -1)}
                  aria-label="上へ移動"
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  type="button"
                  className="icon-btn"
                  disabled={i === company.flow.length - 1}
                  onClick={() => moveStep(step.id, 1)}
                  aria-label="下へ移動"
                >
                  <ArrowDown size={14} />
                </button>
                <button
                  type="button"
                  className="icon-btn hover:border-danger hover:bg-danger-soft hover:text-danger"
                  onClick={() => removeStep(step.id)}
                  aria-label="削除"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              className="input flex-1"
              list="flow-presets"
              placeholder="ステップ名（例：一次面接）を入力または選択"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addStep()}
            />
            <datalist id="flow-presets">
              {FLOW_PRESETS.map((p) => (
                <option key={p} value={p} />
              ))}
            </datalist>
            <button type="button" className="btn-primary" onClick={addStep}>
              <Plus size={15} strokeWidth={2.6} />
              追加
            </button>
          </div>
        </div>
      )}
    </SectionCard>
  )
}
