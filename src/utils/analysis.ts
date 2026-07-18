import type { Company } from '../types'

/**
 * 分析ページ用の集計ロジック。すべて読み取り専用の純関数で、
 * Firestore への書き込みや Company の変更は一切行わない。
 */

/** 選考が終わった（結果が出た・辞退した）ステータスか */
export function isClosedStatus(status: Company['status']): boolean {
  return status === '内定' || status === '不合格' || status === '辞退'
}

/**
 * 企業ごとの「どこまで通過したか」。
 * - 不合格・辞退で振り返りの「落ちたステップ」が選択済み → そのステップの手前まで通過
 * - 内定 → フローの全ステップを通過
 * - それ以外（選考中、または落ちたステップ未選択） → 現在地より手前まで通過
 *   （現在地のステップ自体は結果が出ていないため通過に数えない）
 */
function progressOf(company: Company): {
  passedUpTo: number
  endIndex: number | null
  endKind: 'failed' | 'withdrawn' | null
} {
  const rejected = company.status === '不合格' || company.status === '辞退'
  if (rejected) {
    const endIndex = company.flow.findIndex((s) => s.id === company.rejectedStepId)
    if (endIndex >= 0) {
      return {
        passedUpTo: endIndex,
        endIndex,
        endKind: company.status === '不合格' ? 'failed' : 'withdrawn',
      }
    }
    // 落ちたステップが未選択なら、現在地より手前までは通過していたとみなす
    const currentIndex = company.flow.findIndex((s) => s.id === company.currentStepId)
    return { passedUpTo: Math.max(currentIndex, 0), endIndex: null, endKind: null }
  }
  if (company.status === '内定') {
    return { passedUpTo: company.flow.length, endIndex: null, endKind: null }
  }
  const currentIndex = company.flow.findIndex((s) => s.id === company.currentStepId)
  return { passedUpTo: Math.max(currentIndex, 0), endIndex: null, endKind: null }
}

export interface StageStat {
  label: string
  /** このステップを通過した企業数 */
  passed: number
  /** このステップで不合格になった企業数（振り返りで選択されたもの） */
  failed: number
  /** このステップで辞退した企業数（振り返りで選択されたもの） */
  withdrawn: number
  /** passed / (passed + failed)。辞退は落選ではないため分母に含めない。分母0なら null */
  passRate: number | null
}

/**
 * 選考段階別の通過状況。企業ごとにフローのステップ名は自由入力なので、
 * 同じラベル（前後空白は無視）のステップを同一段階とみなして集計する。
 * 並び順は、各社フロー内での平均位置（早い段階ほど先頭）。
 */
export function stageStats(companies: Company[]): StageStat[] {
  const map = new Map<
    string,
    { passed: number; failed: number; withdrawn: number; orderSum: number; orderCount: number }
  >()
  const at = (label: string) => {
    const key = label.trim()
    let entry = map.get(key)
    if (!entry) {
      entry = { passed: 0, failed: 0, withdrawn: 0, orderSum: 0, orderCount: 0 }
      map.set(key, entry)
    }
    return entry
  }

  for (const c of companies) {
    const { passedUpTo, endIndex, endKind } = progressOf(c)
    c.flow.forEach((step, i) => {
      const label = step.label.trim()
      if (!label) return
      const entry = at(label)
      entry.orderSum += i
      entry.orderCount += 1
      if (i < passedUpTo) entry.passed += 1
      if (endKind && i === endIndex) {
        if (endKind === 'failed') entry.failed += 1
        else entry.withdrawn += 1
      }
    })
  }

  return [...map.entries()]
    .map(([label, e]) => ({
      label,
      passed: e.passed,
      failed: e.failed,
      withdrawn: e.withdrawn,
      passRate: e.passed + e.failed > 0 ? e.passed / (e.passed + e.failed) : null,
      order: e.orderSum / e.orderCount,
    }))
    .sort((a, b) => a.order - b.order || a.label.localeCompare(b.label, 'ja'))
    .map(({ order: _order, ...stat }) => stat)
}

export interface IndustryStat {
  industry: string
  total: number
  offers: number
  failed: number
  withdrawn: number
  /** まだ選考中（結果が出ていない）企業数 */
  active: number
  /** failed / 結果が出た企業数（内定+不合格+辞退）。分母0なら null */
  failRate: number | null
}

/** 業界別の選考の進み具合・不合格率 */
export function industryStats(companies: Company[]): IndustryStat[] {
  const map = new Map<string, IndustryStat>()
  for (const c of companies) {
    const industry = c.industry.trim() || '未設定'
    let entry = map.get(industry)
    if (!entry) {
      entry = { industry, total: 0, offers: 0, failed: 0, withdrawn: 0, active: 0, failRate: null }
      map.set(industry, entry)
    }
    entry.total += 1
    if (c.status === '内定') entry.offers += 1
    else if (c.status === '不合格') entry.failed += 1
    else if (c.status === '辞退') entry.withdrawn += 1
    else entry.active += 1
  }
  return [...map.values()]
    .map((e) => {
      const closed = e.offers + e.failed + e.withdrawn
      return { ...e, failRate: closed > 0 ? e.failed / closed : null }
    })
    .sort((a, b) => b.total - a.total || a.industry.localeCompare(b.industry, 'ja'))
}

/**
 * 応募時期として使う日付。登録日時（createdAt）があればそれを使い、
 * 無い古いデータは最初の予定日にフォールバックする。どちらも無ければ null
 */
export function applicationDateOf(company: Company): string | null {
  if (company.createdAt) return company.createdAt
  const dates = company.schedules
    .flatMap((s) => [s.date, ...(s.candidateDates ?? [])])
    .filter((d) => d && !Number.isNaN(new Date(d).getTime()))
  if (dates.length === 0) return null
  return dates.reduce((min, d) => (new Date(d) < new Date(min) ? d : min))
}

export interface MonthlyCount {
  /** 並べ替え用キー（例: 2026-04） */
  key: string
  /** 表示用ラベル（例: 2026年4月） */
  label: string
  count: number
}

/**
 * 月別の応募数。応募時期が分かる企業を月ごとに数え、
 * 期間の途中で応募が無かった月も 0 件として埋める。
 * 応募時期が分からない企業数は unknown として返す
 */
export function monthlyApplications(companies: Company[]): {
  months: MonthlyCount[]
  unknown: number
} {
  const counts = new Map<string, number>()
  let unknown = 0
  for (const c of companies) {
    const iso = applicationDateOf(c)
    if (!iso) {
      unknown += 1
      continue
    }
    const d = new Date(iso)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  if (counts.size === 0) return { months: [], unknown }

  const keys = [...counts.keys()].sort()
  const first = keys[0]
  const last = keys[keys.length - 1]
  const months: MonthlyCount[] = []
  let [y, m] = first.split('-').map(Number)
  // 最初の応募月から最後の応募月まで、応募0の月も含めて連続で並べる
  for (;;) {
    const key = `${y}-${String(m).padStart(2, '0')}`
    months.push({ key, label: `${y}年${m}月`, count: counts.get(key) ?? 0 })
    if (key === last) break
    m += 1
    if (m > 12) {
      m = 1
      y += 1
    }
  }
  return { months, unknown }
}

export interface TagCount {
  tag: string
  count: number
}

/** 敗因タグの集計（頻度の高い順） */
export function tagRanking(companies: Company[]): TagCount[] {
  const counts = new Map<string, number>()
  for (const c of companies) {
    for (const tag of c.rejectionTags) {
      const key = tag.trim()
      if (!key) continue
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, 'ja'))
}

/** 表記ゆれを吸収するための質問文の正規化（空白の圧縮と末尾の記号除去のみ） */
export function normalizeQuestion(q: string): string {
  return q
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[?？。．]+$/u, '')
}

export interface QuestionCount {
  /** 表示用の質問文（最初に見つかった元の表記） */
  question: string
  count: number
}

/**
 * 面接でよく聞かれた質問の傾向。面接記録の質問と、企業ごとの面接対策の質問を
 * 単純な出現頻度で集計する（自然言語処理はしない）
 */
export function questionRanking(companies: Company[]): QuestionCount[] {
  const counts = new Map<string, { question: string; count: number }>()
  const add = (raw: string) => {
    const key = normalizeQuestion(raw)
    if (!key) return
    const entry = counts.get(key)
    if (entry) entry.count += 1
    else counts.set(key, { question: raw.trim(), count: 1 })
  }
  for (const c of companies) {
    for (const iv of c.interviews) {
      for (const qa of iv.qas) add(qa.question)
    }
    for (const node of c.prepNodes) add(node.question)
  }
  return [...counts.values()].sort(
    (a, b) => b.count - a.count || a.question.localeCompare(b.question, 'ja'),
  )
}

/** ステップ名から段階の種類をざっくり判定する（アドバイスの条件分岐用） */
function stageKind(label: string): 'es' | 'webtest' | 'gd' | 'interview' | 'other' {
  if (label.includes('ES')) return 'es'
  if (/Webテスト|SPI|玉手箱|TG-WEB|テストセンター/i.test(label)) return 'webtest'
  if (label.includes('GD') || label.includes('グループディスカッション')) return 'gd'
  if (label.includes('面接') || label.includes('面談')) return 'interview'
  return 'other'
}

/** 敗因タグのプリセットに対応するアドバイス文 */
const TAG_ADVICE: Record<string, string> = {
  ES: 'ESの内容を先輩や友人に読んでもらい、客観的な意見をもらうのがおすすめです。',
  Webテスト: 'Webテストは問題集の反復で伸びやすい分野です。受検前に模擬問題で慣れておきましょう。',
  GD: 'GDは役割（進行・書記・タイムキーパー）を意識して練習すると安定しやすくなります。',
  '面接(受け答え)':
    '面接対策タブで想定質問への回答を整理し、声に出して練習してみましょう。',
  '面接(社風・価値観の不一致)':
    '企業研究タブで求める人物像を整理し、自分の価値観と合う企業を優先するのも一つの手です。',
  準備不足: '選考前日にその企業の研究ノートと面接対策を見返す習慣をつけてみましょう。',
}

/**
 * 集計結果に基づく一言アドバイス。あらかじめ決めたルール（条件分岐）のみで、
 * AI等による分析は行わない。条件を満たすものが無ければ空配列
 */
export function buildAdvice(stages: StageStat[], tags: TagCount[]): string[] {
  const advice: string[] = []

  // 段階の種類ごとに合算して、落選が目立つ（2社以上・通過率50%未満）段階を指摘する
  const byKind = new Map<ReturnType<typeof stageKind>, { passed: number; failed: number }>()
  for (const s of stages) {
    const kind = stageKind(s.label)
    const entry = byKind.get(kind) ?? { passed: 0, failed: 0 }
    entry.passed += s.passed
    entry.failed += s.failed
    byKind.set(kind, entry)
  }
  const rate = (e: { passed: number; failed: number }) => e.passed / (e.passed + e.failed)
  const kindMessages: [ReturnType<typeof stageKind>, string][] = [
    ['es', 'ES通過率が50%を下回っています。ESの内容の見直しを優先しましょう。'],
    ['webtest', 'Webテストでの落選が目立ちます。問題集での対策時間を確保しましょう。'],
    ['gd', 'GDでの落選が目立ちます。進め方の型を決めて練習してみましょう。'],
    [
      'interview',
      '面接での落選が続いています。面接対策タブで想定質問への回答を整理し直してみましょう。',
    ],
  ]
  for (const [kind, message] of kindMessages) {
    const e = byKind.get(kind)
    if (e && e.failed >= 2 && rate(e) < 0.5) advice.push(message)
  }

  // 最も多い敗因タグ（2回以上記録されているもの）に応じた一言
  const top = tags[0]
  if (top && top.count >= 2) {
    const message =
      TAG_ADVICE[top.tag] ??
      `敗因タグ「${top.tag}」が${top.count}回記録されています。次の選考前に対策を整理しておきましょう。`
    if (!advice.includes(message)) advice.push(message)
  }

  return advice
}
