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
] as const
export type CompanyStatus = (typeof STATUS_LIST)[number]

export type SelectionType = 'インターン' | '本選考'

export type EventKind = '締切' | '面接' | 'Webテスト' | 'その他'

export interface FlowStep {
  id: string
  label: string
}

export interface Schedule {
  id: string
  type: string
  date: string
  place?: string
  url?: string
  memo?: string
}

export interface Deadline {
  id: string
  label: string
  date: string
}

export interface EsEntry {
  id: string
  question: string
  answer: string
  limit: number
  submittedAt: string | null
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
  deadlines: Deadline[]
  esEntries: EsEntry[]
  interviews: Interview[]
  research: ResearchNotes
  internshipPeriods: InternshipPeriod[]
  ownerId?: string
}

export interface NewCompanyInput {
  name: string
  industry: string
  type: SelectionType
  title: string
}
