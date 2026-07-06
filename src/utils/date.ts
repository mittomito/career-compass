export const DOW = ['日', '月', '火', '水', '木', '金', '土'] as const

export function startOfToday(): Date {
  const t = new Date()
  t.setHours(0, 0, 0, 0)
  return t
}

export function offsetIso(days: number, hours = 0, minutes = 0): string {
  const d = startOfToday()
  d.setDate(d.getDate() + days)
  d.setHours(hours, minutes, 0, 0)
  return d.toISOString()
}

export function fmtMD(iso: string): string {
  const x = new Date(iso)
  return `${x.getMonth() + 1}/${x.getDate()}(${DOW[x.getDay()]})`
}

export function fmtTime(iso: string): string {
  const x = new Date(iso)
  return `${String(x.getHours()).padStart(2, '0')}:${String(x.getMinutes()).padStart(2, '0')}`
}

export function fmtMDT(iso: string): string {
  return `${fmtMD(iso)} ${fmtTime(iso)}`
}

export function daysLeft(iso: string): number {
  const a = new Date(iso)
  a.setHours(0, 0, 0, 0)
  return Math.round((a.getTime() - startOfToday().getTime()) / 86400000)
}

export function relLabel(iso: string): string {
  const n = daysLeft(iso)
  if (n === 0) return '今日'
  if (n === 1) return '明日'
  if (n > 1) return `あと${n}日`
  return '終了'
}

export function isPastDay(iso: string): boolean {
  return daysLeft(iso) < 0
}

export function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function toInputDateTime(iso: string): string {
  const x = new Date(iso)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${x.getFullYear()}-${p(x.getMonth() + 1)}-${p(x.getDate())}T${p(x.getHours())}:${p(x.getMinutes())}`
}

export function toInputDate(iso: string): string {
  return toInputDateTime(iso).slice(0, 10)
}
