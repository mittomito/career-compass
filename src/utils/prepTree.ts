import type { PrepNode } from '../types'

/** 指定した親の直下の質問を、配列の並び順のまま返す（parentId が null ならルート質問）*/
export function childrenOf(nodes: PrepNode[], parentId: string | null): PrepNode[] {
  return nodes.filter((n) => n.parentId === parentId)
}

/** 指定した質問の子孫（深掘り質問）の id をすべて集める。自分自身は含まない */
export function collectDescendantIds(nodes: PrepNode[], id: string): string[] {
  const result: string[] = []
  let frontier = [id]
  while (frontier.length > 0) {
    const next = nodes.filter((n) => n.parentId !== null && frontier.includes(n.parentId))
    const ids = next.map((n) => n.id)
    result.push(...ids)
    frontier = ids
  }
  return result
}

/**
 * ツリー全体を新しい id で複製する（親子関係は保ったまま）。
 * テンプレートを企業へコピーするときに使う。id を振り直すことで、
 * 同じテンプレートを複数企業へ（または同じ企業へ複数回）コピーしても衝突しない。
 */
export function clonePrepNodes(nodes: PrepNode[]): PrepNode[] {
  const idMap = new Map(nodes.map((n) => [n.id, crypto.randomUUID()]))
  return nodes.map((n) => ({
    ...n,
    id: idMap.get(n.id)!,
    // 親が見つからない孤児ノードはルート質問に昇格させ、データとしては失わない
    parentId: n.parentId === null ? null : idMap.get(n.parentId) ?? null,
  }))
}

/** 指定した質問を、その子孫ごと取り除いた配列を返す */
export function removeWithDescendants(nodes: PrepNode[], id: string): PrepNode[] {
  const doomed = new Set([id, ...collectDescendantIds(nodes, id)])
  return nodes.filter((n) => !doomed.has(n.id))
}
