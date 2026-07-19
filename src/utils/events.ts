import type { Company, EventKind, Schedule } from '../types'
import { startOfToday } from './date'

export interface CalendarEvent {
  id: string
  date: Date
  kind: EventKind
  label: string
  companyId: string
  companyName: string
  place?: string
  /** 週表示・日表示など、月表示より詳しい画面でだけ使う */
  memo?: string
  url?: string
}

export function kindOf(label: string): EventKind {
  if (label.includes('GD') || label.includes('グループディスカッション')) return 'GD'
  if (label.includes('動画')) return '動画選考'
  if (label.includes('ES') || label.includes('エントリーシート')) return 'ES'
  if (label.includes('面接')) return '面接'
  if (label.includes('Webテスト') || label.includes('SPI') || label.includes('玉手箱')) return 'Webテスト'
  return 'その他'
}

/** 予定の日付一覧を返す。複数候補日があればそれを、なければ単一日付を1件だけ返す */
export function scheduleDates(s: Schedule): string[] {
  return s.candidateDates && s.candidateDates.length > 0 ? s.candidateDates : [s.date]
}

/**
 * 今日以降で最も近い予定を返す。複数候補日の予定は、候補日それぞれを
 * 独立した日程として扱い、date に該当候補日を入れて返す。
 */
export function nextSchedule(c: Company): Schedule | undefined {
  const t = startOfToday().getTime()
  let best: { s: Schedule; date: string; time: number } | undefined
  for (const s of c.schedules) {
    for (const date of scheduleDates(s)) {
      const time = new Date(date).getTime()
      if (time < t) continue
      if (!best || time < best.time) best = { s, date, time }
    }
  }
  return best ? { ...best.s, date: best.date } : undefined
}

export function buildEvents(companies: Company[]): CalendarEvent[] {
  const events: CalendarEvent[] = []
  for (const c of companies) {
    for (const s of c.schedules) {
      const dates = scheduleDates(s)
      dates.forEach((date, i) => {
        events.push({
          // 単一日付は従来どおりの id を保ち、候補日は日付ごとに枝番を振る
          id: dates.length > 1 ? `s-${s.id}-${i}` : `s-${s.id}`,
          date: new Date(date),
          kind: kindOf(s.type),
          label: dates.length > 1 ? `${s.type}（候補${i + 1}/${dates.length}）` : s.type,
          companyId: c.id,
          companyName: c.name,
          place: s.place,
          memo: s.memo,
          url: s.url,
        })
      })
    }
  }
  return events.sort((a, b) => a.date.getTime() - b.date.getTime())
}
