import { describe, expect, it } from 'vitest'
import { emptyResearch } from '../data/research'
import type { Company } from '../types'
import { buildInternshipBars } from './internships'

function makeCompany(over: Partial<Company> = {}): Company {
  return {
    id: 'c1',
    name: 'テスト企業',
    industry: 'IT・通信',
    type: 'インターン',
    title: '夏季インターン',
    status: '応募予定',
    memo: '',
    mypageUrl: '',
    loginId: '',
    flow: [],
    currentStepId: null,
    schedules: [],
    esEntries: [],
    interviews: [],
    prepNodes: [],
    research: emptyResearch(),
    customResearch: [],
    internshipPeriods: [],
    rejectionMemo: '',
    rejectedStepId: null,
    rejectionTags: [],
    createdAt: '',
    color: '',
    ...over,
  }
}

const period = (id: string, start: Date, end: Date) => ({
  id,
  label: 'テストコース',
  startDate: start.toISOString(),
  endDate: end.toISOString(),
})

describe('buildInternshipBars', () => {
  it('インターン企業の期間をバーに変換する', () => {
    const c = makeCompany({
      internshipPeriods: [period('p1', new Date(2026, 7, 1), new Date(2026, 7, 5))],
    })
    const bars = buildInternshipBars([c])
    expect(bars).toHaveLength(1)
    expect(bars[0]).toMatchObject({ id: 'c1-p1', companyId: 'c1', companyName: 'テスト企業' })
    expect(bars[0].start.getTime()).toBe(new Date(2026, 7, 1).getTime())
    expect(bars[0].end.getTime()).toBe(new Date(2026, 7, 5).getTime())
  })

  it('本選考の企業は期間を持っていても除外する', () => {
    const c = makeCompany({
      type: '本選考',
      internshipPeriods: [period('p1', new Date(2026, 7, 1), new Date(2026, 7, 5))],
    })
    expect(buildInternshipBars([c])).toEqual([])
  })

  it('複数企業・複数期間をすべて展開する', () => {
    const a = makeCompany({
      id: 'a',
      internshipPeriods: [
        period('p1', new Date(2026, 7, 1), new Date(2026, 7, 5)),
        period('p2', new Date(2026, 8, 1), new Date(2026, 8, 3)),
      ],
    })
    const b = makeCompany({
      id: 'b',
      internshipPeriods: [period('p1', new Date(2026, 7, 10), new Date(2026, 7, 12))],
    })
    const ids = buildInternshipBars([a, b]).map((bar) => bar.id)
    expect(ids).toEqual(['a-p1', 'a-p2', 'b-p1'])
  })

  it('期間が未登録なら空配列', () => {
    expect(buildInternshipBars([makeCompany()])).toEqual([])
  })
})
