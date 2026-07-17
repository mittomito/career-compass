import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { emptyResearch } from '../data/research'
import type { Company } from '../types'
import { buildEvents, kindOf, nextSchedule, scheduleDates } from './events'

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
    esEntries: [],
    interviews: [],
    research: emptyResearch(),
    customResearch: [],
    internshipPeriods: [],
    rejectionMemo: '',
    color: '',
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
  it('ES・GD・動画選考を判定できる', () => {
    expect(kindOf('ES')).toBe('ES')
    expect(kindOf('ES提出締切')).toBe('ES')
    expect(kindOf('エントリーシート')).toBe('ES')
    expect(kindOf('GD')).toBe('GD')
    expect(kindOf('グループディスカッション')).toBe('GD')
    expect(kindOf('動画選考')).toBe('動画選考')
    expect(kindOf('動画提出')).toBe('動画選考')
  })
})

describe('scheduleDates', () => {
  it('候補日がなければ単一日付を返す', () => {
    const s = { id: 's1', type: '面接', date: '2026-01-20T00:00:00.000Z' }
    expect(scheduleDates(s)).toEqual(['2026-01-20T00:00:00.000Z'])
  })
  it('候補日があればすべて返す', () => {
    const s = {
      id: 's1',
      type: '面接',
      date: '2026-01-20T00:00:00.000Z',
      candidateDates: ['2026-01-20T00:00:00.000Z', '2026-01-22T00:00:00.000Z'],
    }
    expect(scheduleDates(s)).toHaveLength(2)
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
  it('複数候補日の予定は、未来で最も近い候補日を date に入れて返す', () => {
    const near = new Date(2026, 0, 18).toISOString()
    const c = makeCompany({
      schedules: [
        {
          id: 's1',
          type: '面接',
          date: new Date(2026, 0, 10).toISOString(),
          candidateDates: [new Date(2026, 0, 10).toISOString(), near, new Date(2026, 0, 25).toISOString()],
        },
      ],
    })
    const ns = nextSchedule(c)
    expect(ns?.id).toBe('s1')
    expect(ns?.date).toBe(near)
  })
})

describe('buildEvents', () => {
  it('予定をイベントに変換し、日付昇順に並べる', () => {
    const c = makeCompany({
      schedules: [
        { id: 's1', type: '一次面接', date: new Date(2026, 0, 20, 14, 0).toISOString(), place: '本社' },
        { id: 's2', type: 'ES提出締切', date: new Date(2026, 0, 18).toISOString() },
      ],
    })
    const events = buildEvents([c])
    expect(events).toHaveLength(2)
    // 日付昇順：ES提出締切(1/18) → 面接(1/20)
    expect(events[0]).toMatchObject({ id: 's-s2', kind: 'ES', label: 'ES提出締切', companyId: 'c1' })
    expect(events[1]).toMatchObject({
      id: 's-s1',
      kind: '面接',
      label: '一次面接',
      companyName: 'テスト企業',
      place: '本社',
    })
  })
  it('複数候補日の予定は候補日ごとにイベントを作る', () => {
    const c = makeCompany({
      schedules: [
        {
          id: 's1',
          type: '面接',
          date: new Date(2026, 0, 20).toISOString(),
          candidateDates: [new Date(2026, 0, 20).toISOString(), new Date(2026, 0, 22).toISOString()],
        },
      ],
    })
    const events = buildEvents([c])
    expect(events).toHaveLength(2)
    expect(events[0]).toMatchObject({ id: 's-s1-0', label: '面接（候補1/2）' })
    expect(events[1]).toMatchObject({ id: 's-s1-1', label: '面接（候補2/2）' })
  })
  it('企業がなければ空配列', () => {
    expect(buildEvents([])).toEqual([])
  })
})
