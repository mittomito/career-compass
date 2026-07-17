import { describe, expect, it } from 'vitest'
import type { PrepNode } from '../types'
import { pruneLegacySeeds, seedPrepNodes } from './interviewPrep'

const legacy = (over: Partial<PrepNode>): PrepNode => ({
  id: 'x',
  parentId: null,
  question: '自己PRをお願いします。',
  answer: '',
  ...over,
})

describe('seedPrepNodes', () => {
  it('雛形はガクチカ 1 件と、その深掘り例だけで構成される', () => {
    const nodes = seedPrepNodes()
    const roots = nodes.filter((n) => n.parentId === null)
    expect(roots).toHaveLength(1)
    expect(roots[0].question).toContain('学生時代')
    // 深掘り例はすべてガクチカの直下にぶら下がる
    for (const n of nodes) {
      if (n.parentId !== null) expect(n.parentId).toBe(roots[0].id)
    }
  })
})

describe('pruneLegacySeeds', () => {
  it('手つかずの旧雛形（回答なし・深掘りなし）を取り除く', () => {
    const nodes: PrepNode[] = [
      legacy({ id: 'a', question: '自己PRをお願いします。' }),
      legacy({ id: 'b', question: '当社を志望する理由を教えてください。' }),
      legacy({ id: 'c', question: 'あなたの強みと弱みを教えてください。' }),
      legacy({ id: 'g', question: '学生時代に最も力を入れたことを教えてください。' }),
    ]
    expect(pruneLegacySeeds(nodes).map((n) => n.id)).toEqual(['g'])
  })

  it('回答を記入済みの質問は、雛形と同文でも残す', () => {
    const nodes = [legacy({ id: 'a', answer: '私の強みは…' })]
    expect(pruneLegacySeeds(nodes)).toHaveLength(1)
  })

  it('深掘りを追加済みの質問は、その子ごと残す', () => {
    const nodes: PrepNode[] = [
      legacy({ id: 'a' }),
      { id: 'a1', parentId: 'a', question: '具体的には？', answer: '' },
    ]
    expect(pruneLegacySeeds(nodes)).toHaveLength(2)
  })

  it('ユーザーが自作した質問には触れない', () => {
    const nodes = [legacy({ id: 'a', question: '逆質問は何を聞く？' })]
    expect(pruneLegacySeeds(nodes)).toHaveLength(1)
  })
})
