import { describe, expect, it } from 'vitest'
import type { PrepNode } from '../types'
import { childrenOf, clonePrepNodes, collectDescendantIds, removeWithDescendants } from './prepTree'

// ルート a（子 a1・a2、孫 a1x）とルート b という 2 本のツリー
const nodes: PrepNode[] = [
  { id: 'a', parentId: null, question: 'ガクチカ', answer: '' },
  { id: 'b', parentId: null, question: '志望動機', answer: '' },
  { id: 'a1', parentId: 'a', question: 'なぜ取り組んだ？', answer: '' },
  { id: 'a2', parentId: 'a', question: '苦労した点は？', answer: '' },
  { id: 'a1x', parentId: 'a1', question: '他の選択肢は？', answer: '' },
]

describe('childrenOf', () => {
  it('parentId が null ならルート質問を並び順のまま返す', () => {
    expect(childrenOf(nodes, null).map((n) => n.id)).toEqual(['a', 'b'])
  })

  it('指定した親の直下だけを返す（孫は含まない）', () => {
    expect(childrenOf(nodes, 'a').map((n) => n.id)).toEqual(['a1', 'a2'])
  })

  it('子がなければ空配列を返す', () => {
    expect(childrenOf(nodes, 'b')).toEqual([])
  })
})

describe('collectDescendantIds', () => {
  it('孫以降も含めた子孫すべてを集める（自分自身は含まない）', () => {
    expect(collectDescendantIds(nodes, 'a').sort()).toEqual(['a1', 'a1x', 'a2'])
  })

  it('子がなければ空配列を返す', () => {
    expect(collectDescendantIds(nodes, 'a1x')).toEqual([])
  })
})

describe('clonePrepNodes', () => {
  it('全ノードの id を振り直しつつ、親子関係と内容を保つ', () => {
    const cloned = clonePrepNodes(nodes)
    expect(cloned).toHaveLength(nodes.length)
    // id はすべて新しくなる
    const originalIds = new Set(nodes.map((n) => n.id))
    for (const c of cloned) expect(originalIds.has(c.id)).toBe(false)
    // 質問文と階層構造は同じ
    const roots = childrenOf(cloned, null)
    expect(roots.map((n) => n.question)).toEqual(['ガクチカ', '志望動機'])
    const kids = childrenOf(cloned, roots[0].id)
    expect(kids.map((n) => n.question)).toEqual(['なぜ取り組んだ？', '苦労した点は？'])
    expect(childrenOf(cloned, kids[0].id).map((n) => n.question)).toEqual(['他の選択肢は？'])
  })

  it('2回コピーしても id が衝突しない（同じ企業への追いコピーを想定）', () => {
    const merged = [...clonePrepNodes(nodes), ...clonePrepNodes(nodes)]
    expect(new Set(merged.map((n) => n.id)).size).toBe(merged.length)
  })

  it('親が見つからない孤児ノードはルート質問に昇格する', () => {
    const cloned = clonePrepNodes([
      { id: 'x', parentId: 'ghost', question: '孤児', answer: '' },
    ])
    expect(cloned[0].parentId).toBeNull()
  })
})

describe('removeWithDescendants', () => {
  it('指定した質問を子孫ごと取り除き、他のツリーは残す', () => {
    expect(removeWithDescendants(nodes, 'a').map((n) => n.id)).toEqual(['b'])
  })

  it('途中の質問を消しても、兄弟とその親は残る', () => {
    expect(removeWithDescendants(nodes, 'a1').map((n) => n.id)).toEqual(['a', 'b', 'a2'])
  })

  it('子のない質問は自分だけが消える', () => {
    expect(removeWithDescendants(nodes, 'a1x')).toHaveLength(4)
  })
})
