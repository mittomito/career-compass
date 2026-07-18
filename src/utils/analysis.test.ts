import { describe, expect, it } from 'vitest'
import type { Company } from '../types'
import { normalizeCompany } from './normalize'
import {
  applicationDateOf,
  buildAdvice,
  industryStats,
  monthlyApplications,
  normalizeQuestion,
  questionRanking,
  stageStats,
  tagRanking,
} from './analysis'

/** テスト用の企業。normalizeCompany を通すことで実データと同じ形にする */
function company(over: Partial<Omit<Company, 'id'>> & { id?: string }): Company {
  const { id, ...data } = over
  return normalizeCompany(id ?? 'c1', data)
}

const FLOW = [
  { id: 's-es', label: 'ES' },
  { id: 's-web', label: 'Webテスト' },
  { id: 's-1st', label: '一次面接' },
  { id: 's-final', label: '最終面接' },
]

describe('stageStats', () => {
  it('落ちたステップと通過ステップを集計し、通過率を出す', () => {
    const stats = stageStats([
      // 一次面接で不合格 → ES・Webテストは通過
      company({ flow: FLOW, status: '不合格', rejectedStepId: 's-1st' }),
      // ESで不合格
      company({ id: 'c2', flow: FLOW, status: '不合格', rejectedStepId: 's-es' }),
      // 内定 → 全ステップ通過
      company({ id: 'c3', flow: FLOW, status: '内定' }),
    ])
    expect(stats.map((s) => s.label)).toEqual(['ES', 'Webテスト', '一次面接', '最終面接'])
    const es = stats[0]
    expect(es.passed).toBe(2)
    expect(es.failed).toBe(1)
    expect(es.passRate).toBeCloseTo(2 / 3)
    const first = stats[2]
    expect(first.passed).toBe(1)
    expect(first.failed).toBe(1)
    expect(first.passRate).toBeCloseTo(0.5)
  })

  it('辞退は落選と分けて数え、通過率の分母に入れない', () => {
    const stats = stageStats([
      company({ flow: FLOW, status: '辞退', rejectedStepId: 's-1st' }),
    ])
    const first = stats.find((s) => s.label === '一次面接')!
    expect(first.withdrawn).toBe(1)
    expect(first.failed).toBe(0)
    expect(first.passRate).toBeNull()
  })

  it('落ちたステップ未選択の不合格企業は、現在地より手前だけを通過に数える', () => {
    const stats = stageStats([
      company({ flow: FLOW, status: '不合格', currentStepId: 's-1st' }),
    ])
    expect(stats.find((s) => s.label === 'ES')!.passed).toBe(1)
    expect(stats.find((s) => s.label === '一次面接')!.passed).toBe(0)
    // どこで落ちたかは記録されていないので、落選はどのステップにも計上しない
    expect(stats.every((s) => s.failed === 0)).toBe(true)
  })

  it('フローに存在しない rejectedStepId が残っていてもクラッシュしない', () => {
    const stats = stageStats([
      company({ flow: FLOW, status: '不合格', rejectedStepId: 'deleted-step' }),
    ])
    expect(stats.every((s) => s.failed === 0)).toBe(true)
  })
})

describe('industryStats', () => {
  it('業界ごとに件数と不合格率を集計する', () => {
    const stats = industryStats([
      company({ industry: 'IT・通信', status: '不合格' }),
      company({ id: 'c2', industry: 'IT・通信', status: '内定' }),
      company({ id: 'c3', industry: 'IT・通信', status: '面接予定' }),
      company({ id: 'c4', industry: 'メーカー', status: '応募予定' }),
    ])
    expect(stats[0].industry).toBe('IT・通信')
    expect(stats[0].total).toBe(3)
    expect(stats[0].active).toBe(1)
    expect(stats[0].failRate).toBeCloseTo(0.5)
    // 結果が出た企業が無い業界は不合格率を出さない
    expect(stats[1].failRate).toBeNull()
  })
})

describe('applicationDateOf / monthlyApplications', () => {
  it('createdAt が無い旧データは最初の予定日にフォールバックする', () => {
    const c = company({
      schedules: [
        { id: 's1', type: '面接', date: '2026-05-10T10:00:00.000Z' },
        { id: 's2', type: 'ES', date: '2026-04-01T00:00:00.000Z' },
      ],
    })
    expect(applicationDateOf(c)).toBe('2026-04-01T00:00:00.000Z')
  })

  it('createdAt も予定も無い企業は「時期不明」として数える', () => {
    const { months, unknown } = monthlyApplications([company({})])
    expect(months).toEqual([])
    expect(unknown).toBe(1)
  })

  it('月ごとに数え、応募が無い月は0件で埋める', () => {
    const { months, unknown } = monthlyApplications([
      company({ createdAt: '2026-04-15T00:00:00.000Z' }),
      company({ id: 'c2', createdAt: '2026-04-20T00:00:00.000Z' }),
      company({ id: 'c3', createdAt: '2026-06-01T00:00:00.000Z' }),
    ])
    expect(unknown).toBe(0)
    expect(months.map((m) => [m.key, m.count])).toEqual([
      ['2026-04', 2],
      ['2026-05', 0],
      ['2026-06', 1],
    ])
  })
})

describe('tagRanking', () => {
  it('敗因タグを頻度の高い順に並べる', () => {
    const ranking = tagRanking([
      company({ rejectionTags: ['ES', '準備不足'] }),
      company({ id: 'c2', rejectionTags: ['準備不足'] }),
    ])
    expect(ranking).toEqual([
      { tag: '準備不足', count: 2 },
      { tag: 'ES', count: 1 },
    ])
  })
})

describe('questionRanking', () => {
  it('末尾の記号や空白の違いを吸収して出現数を数える', () => {
    expect(normalizeQuestion('ガクチカは？')).toBe(normalizeQuestion('ガクチカは'))
    const ranking = questionRanking([
      company({
        interviews: [
          {
            id: 'iv1',
            date: '2026-05-01T00:00:00.000Z',
            qas: [
              { question: '志望動機を教えてください。', answer: '' },
              { question: '志望動機を教えてください', answer: '' },
            ],
            reflection: '',
            improvement: '',
          },
        ],
        prepNodes: [{ id: 'p1', parentId: null, question: '志望動機を教えてください。', answer: '' }],
      }),
    ])
    expect(ranking).toEqual([{ question: '志望動機を教えてください。', count: 3 }])
  })
})

describe('buildAdvice', () => {
  it('ES通過率が50%未満（落選2社以上）ならES改善のアドバイスを出す', () => {
    const stages = stageStats([
      company({ flow: FLOW, status: '不合格', rejectedStepId: 's-es' }),
      company({ id: 'c2', flow: FLOW, status: '不合格', rejectedStepId: 's-es' }),
      company({ id: 'c3', flow: FLOW, status: '内定' }),
    ])
    const advice = buildAdvice(stages, [])
    expect(advice.some((a) => a.includes('ES'))).toBe(true)
  })

  it('条件を満たす傾向が無ければ空配列を返す', () => {
    const stages = stageStats([company({ flow: FLOW, status: '内定' })])
    expect(buildAdvice(stages, [])).toEqual([])
  })

  it('最頻出の敗因タグ（2回以上）に応じた一言を出す', () => {
    const advice = buildAdvice([], [{ tag: '準備不足', count: 3 }])
    expect(advice).toHaveLength(1)
    expect(advice[0]).toContain('見返す習慣')
  })
})
