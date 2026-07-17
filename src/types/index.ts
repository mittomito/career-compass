export const STATUS_LIST = [
  '応募予定',
  'ES提出中',
  'ES結果待ち',
  'ES通過',
  'Webテスト',
  'Webテスト結果待ち',
  '面接予定',
  '面接結果待ち',
  '内定',
  '不合格',
  '辞退',
] as const
export type CompanyStatus = (typeof STATUS_LIST)[number]

export type SelectionType = 'インターン' | '本選考'

export type EventKind = 'ES' | 'GD' | '動画選考' | '面接' | 'Webテスト' | 'その他'

export interface FlowStep {
  id: string
  label: string
}

export interface Schedule {
  id: string
  type: string
  /** 単一日付、または候補日の先頭（最も早い日）。ISO 8601 文字列 */
  date: string
  /**
   * 企業から複数の候補日を提示された場合のみ、全候補日を昇順で保持する。
   * 未設定・1件以下の場合は date のみの単一日付として扱う。
   */
  candidateDates?: string[]
  place?: string
  url?: string
  memo?: string
}

/**
 * 旧バージョンの「締切」。読み込み時に Schedule へ変換され、UI からは参照しない。
 * 移行済み予定（id が dl- で始まるもの）を削除したとき、次回読み込みで
 * 復活しないよう、変換元の締切も一緒に取り除くためだけに型として残している。
 */
export interface LegacyDeadline {
  id: string
  label: string
  date: string
}

export interface EsEntry {
  id: string
  question: string
  answer: string
  limit: number
}

export interface InterviewQA {
  question: string
  answer: string
}

export interface Interview {
  id: string
  date: string
  qas: InterviewQA[]
  reflection: string
  improvement: string
}

export interface InternshipPeriod {
  id: string
  label: string
  /** ISO 8601 文字列（日付のみ運用） */
  startDate: string
  endDate: string
}

export const RESEARCH_CATEGORIES = [
  '社長メッセージ',
  '経営理念・行動指針',
  '事業内容',
  '企業ニュース',
  'IR情報',
  '求める人物像',
  '志望理由に使えそうなポイント',
  'その他メモ',
] as const
export type ResearchCategory = (typeof RESEARCH_CATEGORIES)[number]

export interface ResearchEntry {
  url: string
  summary: string
  memo: string
}

export type ResearchNotes = Record<ResearchCategory, ResearchEntry>

/** 固定カテゴリに加えて、企業ごとに自由に追加できる企業研究カテゴリ */
export interface CustomResearchCategory {
  id: string
  name: string
  url: string
  summary: string
  memo: string
}

export interface Company {
  id: string
  name: string
  industry: string
  type: SelectionType
  title: string
  status: CompanyStatus
  memo: string
  mypageUrl: string
  loginId: string
  flow: FlowStep[]
  currentStepId: string | null
  schedules: Schedule[]
  /** 旧データ用。読み込み時に schedules へ統合済み。新規作成では持たない */
  deadlines?: LegacyDeadline[]
  esEntries: EsEntry[]
  interviews: Interview[]
  research: ResearchNotes
  customResearch: CustomResearchCategory[]
  internshipPeriods: InternshipPeriod[]
  /** ステータスが「不合格」「辞退」のときだけ使う振り返りメモ */
  rejectionMemo: string
  /** インターン期間カレンダーの表示色。空文字なら自動割り当て */
  color: string
  ownerId?: string
}

export interface NewCompanyInput {
  name: string
  industry: string
  type: SelectionType
  title: string
}
