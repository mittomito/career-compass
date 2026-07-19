import { CalendarClock, StickyNote, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCurrentStep } from '../../hooks/useCurrentStep'
import type { Company } from '../../types'
import { daysLeft, fmtMD, fmtMDT, relLabel } from '../../utils/date'
import { nextSchedule } from '../../utils/events'
import AspirationStars from '../common/AspirationStars'
import StatusBadge from '../common/StatusBadge'

export default function CompanyCard({ company }: { company: Company }) {
  const navigate = useNavigate()
  const ns = nextSchedule(company)
  // 種類を問わず、3日以内に迫った予定は強調して緊急度を伝える
  const near = ns !== undefined && daysLeft(ns.date) <= 3
  const { step, index, total } = useCurrentStep(company)

  const goDetail = () => navigate(`/companies/${company.id}`)

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={goDetail}
      onKeyDown={(e) => e.key === 'Enter' && goDetail()}
      className="card cursor-pointer transition hover:border-brand hover:shadow-lift"
    >
      {/* モバイル：正方形寄りのコンパクトカード（詳細ボタンなし、カード全体がリンク） */}
      <div className="flex aspect-square flex-col p-3.5 md:hidden">
        <p className="truncate text-[16px] font-extrabold leading-snug" title={company.name}>
          {company.name}
        </p>

        <div className="mt-1.5 flex flex-col gap-1">
          <span className="flex items-center gap-1.5">
            <span className="tag w-fit px-1.5 py-0 text-[10px]">{company.type}</span>
            {/* 表示が煩雑にならないよう、設定済みのときだけ塗りつぶし星のみ出す */}
            {company.aspiration > 0 && (
              <AspirationStars value={company.aspiration} size={10} showEmpty={false} />
            )}
          </span>
          <span className="truncate text-[11px] text-ink-sub" title={company.title}>
            {company.title}
          </span>
        </div>

        <div className="flex-1" />

        <div className="min-w-0 border-t border-line pt-2">
          <StatusBadge status={company.status} />
          {step && (
            <p className="mt-1 truncate text-[11px] text-ink-sub">
              {step.label}（{index + 1}/{total}）
            </p>
          )}

          <div className="mt-1.5 flex flex-col gap-0.5 text-[10px] font-semibold text-ink-sub">
            {ns && (
              <span className={`flex items-center gap-1 truncate ${near ? 'font-bold text-danger' : ''}`}>
                <CalendarClock size={11} className={`shrink-0 ${near ? 'text-danger' : 'text-brand'}`} />
                {fmtMD(ns.date)}（{relLabel(ns.date)}）{near && '⚠'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* デスクトップ：従来の横長レイアウト */}
      <div className="hidden grid-cols-[minmax(200px,1.25fr)_minmax(120px,0.9fr)_minmax(160px,1.15fr)_minmax(130px,1fr)] items-center gap-x-4 gap-y-3 px-5 py-4 md:grid">
        <div>
          <p className="text-[17px] font-extrabold leading-snug">{company.name}</p>
          <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-ink-sub">
            <span className="tag">{company.type}</span>
            {company.title}
            {company.aspiration > 0 && (
              <AspirationStars value={company.aspiration} size={11} showEmpty={false} />
            )}
          </p>
        </div>

        <div>
          <p className="cell-label mb-1">
            <TrendingUp size={11} />
            選考状況
          </p>
          <StatusBadge status={company.status} />
          {step && (
            <p className="mt-1 text-xs text-ink-sub">
              {step.label}（{index + 1}/{total}）
            </p>
          )}
        </div>

        <div>
          <p className="cell-label mb-1">
            <CalendarClock size={11} />
            次回予定
          </p>
          {ns ? (
            <>
              <p className={`text-sm font-semibold ${near ? 'text-danger' : ''}`}>
                {fmtMDT(ns.date)} {near && '⚠'}
              </p>
              <p className={`text-xs ${near ? 'text-danger' : 'text-ink-sub'}`}>
                {ns.type}（{relLabel(ns.date)}）
              </p>
            </>
          ) : (
            <p className="text-sm text-ink-faint">—</p>
          )}
        </div>

        <div>
          <p className="cell-label mb-1">
            <StickyNote size={11} />
            メモ
          </p>
          <p className="line-clamp-2 break-words text-xs text-ink-sub">{company.memo || '—'}</p>
        </div>
      </div>
    </div>
  )
}
