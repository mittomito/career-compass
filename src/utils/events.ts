import type { Company, Deadline, EventKind, Schedule } from '../types'
import { startOfToday } from './date'

export interface CalendarEvent {
  id: string
  date: Date
  kind: EventKind
  label: string
  companyId: string
  companyName: string
  place?: string
}

export function kindOf(label: string): EventKind {
  if (label.includes('締切')) return '締切'
  if (label.includes('面接')) return '面接'
  if (label.includes('Webテスト') || label.includes('SPI') || label.includes('玉手箱')) return 'Webテスト'
  return 'その他'
}

const byDateAsc = (a: { date: string }, b: { date: string }) =>
  new Date(a.date).getTime() - new Date(b.date).getTime()

export function nextSchedule(c: Company): Schedule | undefined {
  const t = startOfToday().getTime()
  return [...c.schedules].filter((s) => new Date(s.date).getTime() >= t).sort(byDateAsc)[0]
}

export function nextDeadline(c: Company): Deadline | undefined {
  const t = startOfToday().getTime()
  return [...c.deadlines].filter((s) => new Date(s.date).getTime() >= t).sort(byDateAsc)[0]
}

export function buildEvents(companies: Company[]): CalendarEvent[] {
  const events: CalendarEvent[] = []
  for (const c of companies) {
    for (const s of c.schedules) {
      events.push({
        id: `s-${s.id}`,
        date: new Date(s.date),
        kind: kindOf(s.type),
        label: s.type,
        companyId: c.id,
        companyName: c.name,
        place: s.place,
      })
    }
    for (const d of c.deadlines) {
      events.push({
        id: `d-${d.id}`,
        date: new Date(d.date),
        kind: '締切',
        label: d.label,
        companyId: c.id,
        companyName: c.name,
      })
    }
  }
  return events.sort((a, b) => a.date.getTime() - b.date.getTime())
}
