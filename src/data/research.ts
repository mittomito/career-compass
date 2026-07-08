import type { ResearchNotes } from '../types'
import { RESEARCH_CATEGORIES } from '../types'

/** 全カテゴリが未記入の企業研究ノートを作る（新規企業の初期値） */
export function emptyResearch(): ResearchNotes {
  return Object.fromEntries(
    RESEARCH_CATEGORIES.map((c) => [c, { url: '', summary: '', memo: '' }]),
  ) as ResearchNotes
}
