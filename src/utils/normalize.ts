import { emptyResearch } from '../data/research'
import type { Company, Schedule } from '../types'

/** Firestore に保存されているドキュメントの形（古いバージョンのフィールド欠損・残存を含む） */
export type StoredCompany = Partial<Omit<Company, 'id'>>

/** 旧「締切」を予定に変換したときの id。読み込みのたびに同じ id になるよう決定的に作る */
export const migratedDeadlineId = (deadlineId: string) => `dl-${deadlineId}`

/**
 * 旧バージョンの deadlines を schedules に統合する。
 * - Firestore 上の deadlines フィールドは書き換えず、読み込み時に毎回変換する
 *   （移行に失敗しても元データが失われない）。
 * - id を決定的に振ることで、変換済みの予定が schedules として保存済みでも
 *   二重に追加されない。
 */
export function mergeDeadlinesIntoSchedules(data: StoredCompany): Schedule[] {
  const schedules: Schedule[] = [...(data.schedules ?? [])]
  for (const d of data.deadlines ?? []) {
    const id = migratedDeadlineId(d.id)
    if (schedules.some((s) => s.id === id)) continue
    schedules.push({ id, type: d.label, date: d.date })
  }
  return schedules
}

/**
 * Firestore から取得したデータに既定値を補完して Company に整える。
 * 後からアプリに追加されたフィールド（customResearch など）を持たない
 * 古いドキュメントを読んでもクラッシュしないようにするための防御層。
 */
export function normalizeCompany(id: string, data: StoredCompany): Company {
  return {
    id,
    name: data.name ?? '',
    industry: data.industry ?? '',
    type: data.type ?? '本選考',
    title: data.title ?? '',
    status: data.status ?? '応募予定',
    memo: data.memo ?? '',
    mypageUrl: data.mypageUrl ?? '',
    loginId: data.loginId ?? '',
    flow: data.flow ?? [],
    currentStepId: data.currentStepId ?? null,
    schedules: mergeDeadlinesIntoSchedules(data),
    // 移行済み予定を削除したとき、変換元も一緒に消せるようメモリ上には保持する
    deadlines: data.deadlines,
    esEntries: data.esEntries ?? [],
    interviews: data.interviews ?? [],
    // research はフィールド自体の欠損に加え、カテゴリ追加時の「一部キーだけ無い」状態も補完する
    research: { ...emptyResearch(), ...data.research },
    customResearch: data.customResearch ?? [],
    internshipPeriods: data.internshipPeriods ?? [],
    rejectionMemo: data.rejectionMemo ?? '',
    color: data.color ?? '',
    ownerId: data.ownerId,
  }
}
