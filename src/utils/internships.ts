import type { Company } from '../types'

export interface InternshipBar {
  id: string
  companyId: string
  companyName: string
  label: string
  start: Date
  end: Date
}

/** インターン企業の期間だけを抽出してバー表示用データに変換する */
export function buildInternshipBars(companies: Company[]): InternshipBar[] {
  const bars: InternshipBar[] = []
  for (const c of companies) {
    if (c.type !== 'インターン') continue
    for (const p of c.internshipPeriods) {
      bars.push({
        id: `${c.id}-${p.id}`,
        companyId: c.id,
        companyName: c.name,
        label: p.label,
        start: new Date(p.startDate),
        end: new Date(p.endDate),
      })
    }
  }
  return bars
}