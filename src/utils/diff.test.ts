import { describe, expect, it } from 'vitest'
import { changedTopLevelFields } from './diff'

describe('changedTopLevelFields', () => {
  it('変更のないオブジェクトでは空を返す', () => {
    const a = { name: '企業A', memo: '', schedules: [{ id: 's1', date: '2026-01-01' }] }
    expect(changedTopLevelFields(a, { ...a })).toEqual({})
  })

  it('変更されたフィールドだけを返す', () => {
    const before = { name: '企業A', status: '応募予定', memo: 'x' }
    const after = { name: '企業A', status: '内定', memo: 'x' }
    expect(changedTopLevelFields(before, after)).toEqual({ status: '内定' })
  })

  it('配列・ネストしたオブジェクトの変更も検出する（深い比較）', () => {
    const before = {
      schedules: [{ id: 's1', type: '面接' }],
      research: { 事業内容: { url: '', summary: '', memo: '' } },
    }
    const after = {
      schedules: [{ id: 's1', type: '面接' }, { id: 's2', type: 'Webテスト' }],
      research: { 事業内容: { url: '', summary: '要約', memo: '' } },
    }
    const changed = changedTopLevelFields(before, after)
    expect(Object.keys(changed).sort()).toEqual(['research', 'schedules'])
    expect(changed.schedules).toEqual(after.schedules)
  })

  it('無関係なフィールドは含まれない（別端末の変更を巻き戻さないための性質）', () => {
    const before = { esEntries: [{ id: 'e1' }], deadlines: [] }
    const after = { esEntries: [{ id: 'e1' }], deadlines: [{ id: 'd1' }] }
    const changed = changedTopLevelFields(before, after)
    expect(changed).toEqual({ deadlines: [{ id: 'd1' }] })
    expect('esEntries' in changed).toBe(false)
  })

  it('null と値の変更を区別して検出する', () => {
    expect(changedTopLevelFields({ currentStepId: null }, { currentStepId: 'step1' })).toEqual({
      currentStepId: 'step1',
    })
    expect(changedTopLevelFields({ currentStepId: 'step1' }, { currentStepId: null })).toEqual({
      currentStepId: null,
    })
  })

  it('before に無いキーが after にあれば変更として返す', () => {
    expect(changedTopLevelFields({}, { memo: '' })).toEqual({ memo: '' })
  })
})
