import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { emptyResearch } from '../data/seed'
import type { Company } from '../types'
import { buildEvents, kindOf, nextDeadline, nextSchedule } from './events'

// 「今日」をローカルタイムの 2026-01-15 12:30 に固定
const NOW = new Date(2026, 0, 15, 12, 30, 0)

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(NOW)
})
afterEach(() => {
  vi.useRealTimers()
})

function makeCompany(over: Partial<Company> = {}): Company {
  return {
    id: 'c1',
    name: 'テスト企業',
    industry: 'IT・通信',
    type: '本選考',
    title: '総合職',
    status: '応募予定',
    memo: '',
    mypageUrl: '',
    loginId: '',
    flow: [],
    currentStepId: null,
    schedules: [],
    deadlines: [],
    esEntries: [],
    interviews: [],
    research: emptyResearch(),
    internshipPeriods: [],
    ...over,
  }
}

describe('kindOf', () => {
  it('ラベルの部分一致で予定種別を判定する', () => {
    expect(kindOf('一次面接')).toBe('面接')
    expect(kindOf('Webテスト受検')).toBe('Webテスト')
    expect(kindOf('SPI')).toBe('Webテスト')
    expect(kindOf('玉手箱')).toBe('Webテスト')
    expect(kindOf('説明会')).toBe('その他')
  })
  it('「締切」を含む場合は他の語より優先する', () => {
    expect(kindOf('ES提出締切')).toBe('締切')
    expect(kindOf('Webテスト受検締切')).toBe('締切')
  })
})

describe('nextSchedule', () => {
  it('今日以降で最も近い予定を返す（今日の過ぎた時刻も当日中は含む）', () => {
    const c = makeCompany({
      schedules: [
        { id: 's-past', type: '面接', date: new Date(2026, 0, 10).toISOString() },
        { id: 's-today', type: '面接', date: new Date(2026, 0, 15, 9, 0).toISOString() },
        { id: 's-future', type: '面接', date: new Date(2026, 0, 20).toISOString() },
      ],
    })
    expect(nextSchedule(c)?.id).toBe('s-today')
  })
  it('未来の予定がなければ undefined', () => {
    const c = makeCompany({
      schedules: [{ id: 's1', type: '面接', date: new Date(2026, 0, 10).toISOString() }],
    })
    expect(nextSchedule(c)).toBeUndefined()
  })
})

describe('nextDeadline', () => {
  it('今日以降で最も近い締切を返す', () => {
    const c = makeCompany({
      deadlines: [
        { id: 'd-far', label: '内定承諾締切', date: new Date(2026, 0, 30).toISOString() },
        { id: 'd-near', label: 'ES提出締切', date: new Date(2026, 0, 18).toISOString() },
        { id: 'd-past', label: '応募締切', date: new Date(2026, 0, 5).toISOString() },
      ],
    })
    expect(nextDeadline(c)?.id).toBe('d-near')
  })
  it('締切がなければ undefined', () => {
    expect(nextDeadline(makeCompany())).toBeUndefined()
  })
})

describe('buildEvents', () => {
  it('予定と締切をイベントに変換し、日付昇順に並べる', () => {
    const c = makeCompany({
      schedules: [
        { id: 's1', type: '一次面接', date: new Date(2026, 0, 20, 14, 0).toISOString(), place: '本社' },
      ],
      deadlines: [{ id: 'd1', label: 'ES提出締切', date: new Date(2026, 0, 18).toISOString() }],
    })
    const events = buildEvents([c])
    expect(events).toHaveLength(2)
    // 日付昇順：締切(1/18) → 面接(1/20)
    expect(events[0]).toMatchObject({ id: 'd-d1', kind: '締切', label: 'ES提出締切', companyId: 'c1' })
    expect(events[1]).toMatchObject({
      id: 's-s1',
      kind: '面接',
      label: '一次面接',
      companyName: 'テスト企業',
      place: '本社',
    })
  })
  it('企業がなければ空配列', () => {
    expect(buildEvents([])).toEqual([])
  })
})
