import { Link } from 'react-router-dom'
import EmptyState from '../common/EmptyState'
import { DOW } from '../../utils/date'
import type { InternshipBar } from '../../utils/internships'

interface Props {
  date: Date
  bars: InternshipBar[]
  colorOf: (companyId: string) => string
}

function atMidnight(d: Date): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function fmtMD(d: Date): string {
  return `${d.getMonth() + 1}/${d.getDate()}`
}

/** 選択日に開催中のインターンだけを一覧表示する（モバイル向け） */
export default function InternshipDayPanel({ date, bars, colorOf }: Props) {
  const d = atMidnight(date).getTime()
  const active = bars.filter((b) => atMidnight(b.start).getTime() <= d && d <= atMidnight(b.end).getTime())

  return (
    <div className="card mt-4 p-5">
      <h2 className="text-sm font-bold text-ink">
        {date.getMonth() + 1}月{date.getDate()}日（{DOW[date.getDay()]}）開催中のインターン
      </h2>
      {active.length === 0 ? (
        <div className="mt-4">
          <EmptyState title="開催中のインターンはありません" />
        </div>
      ) : (
        <ul className="mt-4 flex flex-col gap-2.5">
          {active.map((b) => (
            <li key={b.id}>
              <Link
                to={`/companies/${b.companyId}?tab=selection`}
                className="block rounded-xl border border-line p-3 transition hover:border-brand hover:shadow-card"
                style={{ borderLeft: `4px solid ${colorOf(b.companyId)}` }}
              >
                <p className="text-sm font-bold text-ink">{b.companyName}</p>
                <p className="mt-1 text-xs text-ink-sub">
                  {fmtMD(b.start)} 〜 {fmtMD(b.end)}
                  {b.label && ` ・ ${b.label}`}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}