import { describe, expect, it } from 'vitest'
import { RESEARCH_CATEGORIES } from '../types'
import { mergeDeadlinesIntoSchedules, normalizeCompany } from './normalize'

describe('normalizeCompany', () => {
  it('空のドキュメントでも安全な既定値で Company を作る', () => {
    const c = normalizeCompany('id1', {})
    expect(c.id).toBe('id1')
    expect(c.schedules).toEqual([])
    expect(c.esEntries).toEqual([])
    expect(c.prepNodes).toEqual([])
    expect(c.customResearch).toEqual([])
    expect(c.rejectionMemo).toBe('')
    expect(c.rejectedStepId).toBeNull()
    expect(c.rejectionTags).toEqual([])
    expect(c.createdAt).toBe('')
    expect(c.color).toBe('')
    expect(c.aspiration).toBe(0)
    expect(c.obogVisits).toEqual([])
    for (const cat of RESEARCH_CATEGORIES) {
      expect(c.research[cat]).toEqual({ url: '', summary: '', memo: '' })
    }
  })

  it('submittedAt など廃止済みフィールドが残っていてもエラーにならない', () => {
    const c = normalizeCompany('id1', {
      esEntries: [
        // 旧データには submittedAt が残っている
        { id: 'e1', question: 'Q', answer: 'A', limit: 400, submittedAt: '2026-01-01' } as never,
      ],
    })
    expect(c.esEntries).toHaveLength(1)
    expect(c.esEntries[0].limit).toBe(400)
  })

  it('振り返りフィールドを持たない既存の不合格企業も安全に読み込める', () => {
    const c = normalizeCompany('id1', {
      name: '既存企業',
      status: '不合格',
      rejectionMemo: '面接で緊張してしまった',
    })
    expect(c.status).toBe('不合格')
    expect(c.rejectionMemo).toBe('面接で緊張してしまった')
    expect(c.rejectedStepId).toBeNull()
    expect(c.rejectionTags).toEqual([])
    expect(c.createdAt).toBe('')
  })

  it('志望度・OB・OG訪問を持つドキュメントは値をそのまま保持する', () => {
    const c = normalizeCompany('id1', {
      aspiration: 4,
      obogVisits: [
        {
          id: 'v1',
          date: '2026-07-01T00:00:00.000Z',
          person: '営業部の方',
          qas: [{ question: '入社の決め手は？', answer: '人のよさ' }],
          memo: '話',
          insight: '',
        },
      ],
    })
    expect(c.aspiration).toBe(4)
    expect(c.obogVisits).toHaveLength(1)
    expect(c.obogVisits[0].person).toBe('営業部の方')
    expect(c.obogVisits[0].qas).toHaveLength(1)
  })

  it('qas を持たない旧形式のOB・OG訪問記録も安全に読み込める', () => {
    const c = normalizeCompany('id1', {
      obogVisits: [
        // qas フィールド追加より前に保存された訪問記録
        { id: 'v1', date: '2026-07-01T00:00:00.000Z', person: '', memo: '聞いた話', insight: '活かす' } as never,
      ],
    })
    expect(c.obogVisits).toHaveLength(1)
    expect(c.obogVisits[0].qas).toEqual([])
    expect(c.obogVisits[0].memo).toBe('聞いた話')
    expect(c.obogVisits[0].insight).toBe('活かす')
  })

  it('旧「締切」を予定に変換して統合する', () => {
    const c = normalizeCompany('id1', {
      schedules: [{ id: 's1', type: '一次面接', date: '2026-02-01T10:00:00.000Z' }],
      deadlines: [{ id: 'd1', label: 'ES提出締切', date: '2026-01-20T00:00:00.000Z' }],
    })
    expect(c.schedules).toHaveLength(2)
    expect(c.schedules[1]).toEqual({
      id: 'dl-d1',
      type: 'ES提出締切',
      date: '2026-01-20T00:00:00.000Z',
    })
    // 変換元はメモリ上に保持され、Firestore からも消さない
    expect(c.deadlines).toHaveLength(1)
  })
})

describe('mergeDeadlinesIntoSchedules', () => {
  it('変換済みの予定が保存済みなら二重に追加しない', () => {
    const schedules = mergeDeadlinesIntoSchedules({
      // 過去の書き込みで、変換済み予定が schedules に永続化されているケース
      schedules: [{ id: 'dl-d1', type: 'ES提出締切', date: '2026-01-20T00:00:00.000Z' }],
      deadlines: [{ id: 'd1', label: 'ES提出締切', date: '2026-01-20T00:00:00.000Z' }],
    })
    expect(schedules).toHaveLength(1)
  })

  it('deadlines が無い（新規・移行済み）ドキュメントはそのまま', () => {
    const schedules = mergeDeadlinesIntoSchedules({
      schedules: [{ id: 's1', type: '面接', date: '2026-02-01T10:00:00.000Z' }],
    })
    expect(schedules).toHaveLength(1)
    expect(schedules[0].id).toBe('s1')
  })

  it('複数の締切をすべて予定に変換する', () => {
    const schedules = mergeDeadlinesIntoSchedules({
      deadlines: [
        { id: 'd1', label: 'ES提出締切', date: '2026-01-20T00:00:00.000Z' },
        { id: 'd2', label: 'Webテスト受検締切', date: '2026-01-25T00:00:00.000Z' },
      ],
    })
    expect(schedules.map((s) => s.id)).toEqual(['dl-d1', 'dl-d2'])
    expect(schedules.map((s) => s.type)).toEqual(['ES提出締切', 'Webテスト受検締切'])
  })
})
