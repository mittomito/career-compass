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
  /**
   * 次回の面接前にふと思い出したい一言（任意）。
   * 自由記述のため分析ページの集計対象には含めない。
   * 旧データには存在しないため optional にしている
   */
  nextNote?: string
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

/**
 * 面接対策テンプレートの質問ノード。
 * 全ノードをフラットな配列で持ち、parentId で親子関係（深掘りツリー）を表現する。
 * Firestore はネスト深度に上限があるため、配列のネストではなくこの形にしている。
 */
export interface PrepNode {
  id: string
  /** ルート質問（ガクチカ・志望動機など）は null。深掘り質問は親質問の id */
  parentId: string | null
  question: string
  answer: string
}

/** OB・OG訪問で聞いた質問とその回答のセット */
export interface ObOgQA {
  question: string
  answer: string
}

/** OB・OG訪問の記録（1回の訪問 = 1件） */
export interface ObOgVisit {
  id: string
  /** 訪問日（ISO 8601 文字列、日付のみ運用） */
  date: string
  /** 話を聞いた相手（所属・年次・名前など、書ける範囲で。任意） */
  person: string
  /**
   * 質問と回答のセット。テンプレートから選んでコピーした質問も、手入力の質問も
   * ここに入り、コピー後はテンプレートから独立したデータとして扱う。
   * このフィールド追加より前に作られた訪問記録には存在しないため、欠損時は空配列
   */
  qas: ObOgQA[]
  /** 質問に紐づかないその他のメモ（旧データでは「聞いた話」の本文） */
  memo: string
  /** その後の選考（ES・面接）に活かせそうなこと（任意） */
  insight: string
}

/** OB・OG訪問テンプレート（アカウント共通の「聞くことリスト」）の質問1件 */
export interface ObOgQuestion {
  id: string
  text: string
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
  /**
   * 企業ごとの面接対策（深掘り質問ツリー）。アカウント共通のテンプレート
   * （interviewPreps コレクション）からコピーした後は、独立したデータとして扱う
   */
  prepNodes: PrepNode[]
  research: ResearchNotes
  customResearch: CustomResearchCategory[]
  internshipPeriods: InternshipPeriod[]
  /** ステータスが「不合格」「辞退」のときだけ使う振り返りメモ */
  rejectionMemo: string
  /**
   * 選考が終わった（不合格・辞退した）選考フロー上のステップの id。
   * 自動判定はせず、ユーザーが振り返りタブで手動選択する。未選択は null。
   * フロー編集で該当ステップが削除された場合は「未選択」として扱う
   */
  rejectedStepId: string | null
  /**
   * 敗因タグ。プリセット（REJECTION_TAG_PRESETS）に加えて自由入力のタグも
   * そのまま文字列として持つ。ステータスが「不合格」「辞退」のときだけ使う
   */
  rejectionTags: string[]
  /**
   * 企業を登録した日時（ISO 8601 文字列）。月別の応募数の集計に使う。
   * このフィールド追加より前に作られたドキュメントには存在しないため、
   * 欠損時は空文字（分析側で最初の予定日にフォールバック）
   */
  createdAt: string
  /** インターン期間カレンダーの表示色。空文字なら自動割り当て */
  color: string
  /**
   * 志望度（1〜5 の5段階）。0 は「未設定」を表すニュートラルな状態。
   * このフィールド追加より前のドキュメントには存在しないため、欠損時は 0 として扱う
   */
  aspiration: number
  /** OB・OG訪問の記録（訪問日ごとに1件）。旧ドキュメントには存在しない */
  obogVisits: ObOgVisit[]
  ownerId?: string
}

export interface NewCompanyInput {
  name: string
  industry: string
  type: SelectionType
  title: string
}
