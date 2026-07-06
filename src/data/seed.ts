import type { Company, FlowStep, ResearchNotes } from '../types'
import { RESEARCH_CATEGORIES } from '../types'
import { offsetIso } from '../utils/date'
import { uid } from '../utils/id'

export function emptyResearch(): ResearchNotes {
  return Object.fromEntries(
    RESEARCH_CATEGORIES.map((c) => [c, { url: '', summary: '', memo: '' }]),
  ) as ResearchNotes
}

function flowOf(labels: string[]): FlowStep[] {
  return labels.map((label) => ({ id: uid(), label }))
}

interface SeedInput extends Omit<Company, 'id' | 'flow' | 'currentStepId' | 'research' | 'internshipPeriods'> {
  flowLabels: string[]
  currentIndex: number
  research?: Partial<ResearchNotes>
  internshipPeriods?: Company['internshipPeriods']
}

function make(input: SeedInput): Company {
  const { flowLabels, currentIndex, research, internshipPeriods, ...rest } = input
  const flow = flowOf(flowLabels)
  return {
    id: uid(),
    ...rest,
    flow,
    currentStepId: flow[currentIndex]?.id ?? null,
    research: { ...emptyResearch(), ...research },
    internshipPeriods: internshipPeriods ?? [],
  }
}

export const seedCompanies: Company[] = [
  make({
    name: '三井物産',
    industry: '総合商社',
    type: '本選考',
    title: '2027年卒 総合職',
    status: '面接予定',
    memo: '一次面接は逆質問を3つ以上準備。ケース対策も軽く。',
    mypageUrl: 'https://mypage.example.com/mitsui',
    loginId: 'taro.shukatsu@example.com',
    flowLabels: ['ES', 'SPI', '一次面接', '二次面接', '最終面接', '内定'],
    currentIndex: 2,
    schedules: [
      { id: uid(), type: '一次面接', date: offsetIso(1, 14, 0), place: '本社（大手町）', memo: '受付は13:45まで。学生証を持参。' },
      { id: uid(), type: '社員面談', date: offsetIso(6, 18, 0), place: 'オンライン', url: 'https://zoom.example.com/mitsui', memo: '営業部門の若手社員との面談。' },
    ],
    deadlines: [],
    esEntries: [
      { id: uid(), question: 'あなたが挑戦したいことを教えてください。', answer: '私は途上国のインフラ開発に携わり、現地の生活水準向上に貢献したいと考えています。', limit: 400, submittedAt: offsetIso(-18) },
      { id: uid(), question: 'チームで成果を上げた経験を教えてください。', answer: 'ゼミの共同研究で、意見が対立するメンバー間の調整役を担いました。', limit: 300, submittedAt: offsetIso(-18) },
    ],
    interviews: [],
    research: {
      事業内容: { url: 'https://example.com/mitsui/business', summary: '非資源比率を高める中期経営計画を推進中。', memo: 'フィールドワークの経験と電力事業を接続して話す。' },
      志望理由に使えそうなポイント: { url: '', summary: '', memo: '「挑戦と創造」の社風 → 逆質問は若手の海外駐在について。' },
    },
  }),
  make({
    name: '野村総合研究所',
    industry: 'コンサル',
    type: '本選考',
    title: '経営コンサルティングコース',
    status: 'ES提出中',
    memo: '設問3がまだ。文字数オーバー注意（400字）。',
    mypageUrl: 'https://mypage.example.com/nri',
    loginId: 'taro.shukatsu@example.com',
    flowLabels: ['ES', 'Webテスト', 'GD', '一次面接', '最終面接', '内定'],
    currentIndex: 0,
    schedules: [],
    deadlines: [{ id: uid(), label: 'ES提出締切', date: offsetIso(2, 23, 59) }],
    esEntries: [
      { id: uid(), question: '学生時代に最も力を入れたことを教えてください。', answer: '長期インターンでのWebメディア運営です。', limit: 400, submittedAt: null },
    ],
    interviews: [],
  }),
  make({
    name: 'ソニーグループ',
    industry: 'メーカー',
    type: '本選考',
    title: '事業企画コース',
    status: 'ES結果待ち',
    memo: '結果は今週中に連絡予定とのこと。',
    mypageUrl: 'https://mypage.example.com/sony',
    loginId: 'taro.shukatsu@example.com',
    flowLabels: ['ES', 'Webテスト', '一次面接', '二次面接', '最終面接', '内定'],
    currentIndex: 1,
    schedules: [],
    deadlines: [],
    esEntries: [
      { id: uid(), question: 'ソニーで実現したいことを自由に記述してください。', answer: 'エンタテインメントとテクノロジーの融合領域で、新しい音楽体験を創りたいです。', limit: 500, submittedAt: offsetIso(-9) },
    ],
    interviews: [],
    research: {
      事業内容: { url: '', summary: 'ゲーム / 音楽 / 映画 / エレクトロニクス / 半導体 / 金融の6セグメント。', memo: '' },
      企業ニュース: { url: '', summary: '空間コンテンツ領域への投資拡大。', memo: '面接の雑談で触れられるように。' },
    },
  }),
  make({
    name: '楽天グループ',
    industry: 'IT・通信',
    type: 'インターン',
    title: '夏季エンジニアインターン',
    status: 'Webテスト',
    memo: '玉手箱形式。非言語を重点対策。',
    mypageUrl: 'https://mypage.example.com/rakuten',
    loginId: 'taro.shukatsu@example.com',
    flowLabels: ['ES', 'Webテスト', '面接', '参加'],
    currentIndex: 1,
    schedules: [
      { id: uid(), type: 'Webテスト受検', date: offsetIso(3, 20, 0), place: '自宅受検', url: 'https://test.example.com/rakuten', memo: '受検期限は当日23:59まで。電卓を用意。' },
    ],
    deadlines: [{ id: uid(), label: 'Webテスト受検締切', date: offsetIso(3, 23, 59) }],
    esEntries: [
      { id: uid(), question: 'プログラミング経験について教えてください。', answer: 'Python・JavaScriptを用いた開発経験が2年あります。', limit: 300, submittedAt: offsetIso(-6) },
    ],
    interviews: [],
    internshipPeriods: [
      { id: uid(), label: '本選考直結コース', startDate: offsetIso(15), endDate: offsetIso(19) },
    ],
  }),
  make({
    name: 'リクルート',
    industry: 'IT・通信',
    type: '本選考',
    title: 'ビジネスグロースコース',
    status: '面接結果待ち',
    memo: '二次面接の結果待ち。1週間以内に連絡。',
    mypageUrl: 'https://mypage.example.com/recruit',
    loginId: 'taro.shukatsu@example.com',
    flowLabels: ['ES', 'Webテスト', '一次面接', '二次面接', '最終面接', '内定'],
    currentIndex: 3,
    schedules: [],
    deadlines: [],
    esEntries: [
      { id: uid(), question: 'あなたにとって「働く」とは何ですか。', answer: '自分の強みで他者の選択肢を広げる営みだと考えます。', limit: 300, submittedAt: offsetIso(-40) },
    ],
    interviews: [
      {
        id: uid(),
        date: offsetIso(-20),
        qas: [
          { question: '学生時代に頑張ったことは？', answer: 'Webメディアのインターンで月間PVを3倍にした経験を話した。' },
          { question: 'なぜリクルートなのか？', answer: '「個の尊重」のカルチャーと事業の幅広さ。やや抽象的な回答になってしまった。' },
        ],
        reflection: '志望動機が抽象的で、他社でも言える内容だった。',
        improvement: 'リクルートの具体的な事業と自分の原体験を接続して話す。',
      },
      {
        id: uid(),
        date: offsetIso(-5),
        qas: [
          { question: '入社後に挑戦したい事業領域は？', answer: '教育領域。手応えあり。' },
          { question: 'キャリアの10年後のイメージは？', answer: '事業責任者。少し準備不足で回答が浅くなった。' },
        ],
        reflection: '長期キャリアの質問への準備が不足。',
        improvement: '5年後・10年後のキャリアイメージを言語化しておく。',
      },
    ],
    research: {
      '経営理念・行動指針': { url: '', summary: '「お前はどうしたい？」に象徴される当事者意識のカルチャー。', memo: '最終面接はキャリアビジョンの深掘りに耐えられるように。' },
    },
  }),
  make({
    name: '伊藤忠商事',
    industry: '総合商社',
    type: '本選考',
    title: '総合職',
    status: 'ES通過',
    memo: '次はWebテスト案内待ち。SPI再対策。',
    mypageUrl: 'https://mypage.example.com/itochu',
    loginId: 'taro.shukatsu@example.com',
    flowLabels: ['ES', 'SPI', '一次面接', '二次面接', '最終面接', '内定'],
    currentIndex: 1,
    schedules: [
      { id: uid(), type: '会社説明会', date: offsetIso(4, 10, 0), place: 'オンライン', url: 'https://live.example.com/itochu', memo: '繊維カンパニーの事業紹介あり。' },
    ],
    deadlines: [],
    esEntries: [
      { id: uid(), question: 'あなたの強みと、それを表すエピソードを教えてください。', answer: '強みは「巻き込み力」です。', limit: 400, submittedAt: offsetIso(-15) },
    ],
    interviews: [],
    research: {
      '経営理念・行動指針': { url: '', summary: '「マーケットイン」の発想。生活消費分野に強み。', memo: '朝型勤務など働き方改革の話題も押さえる。' },
    },
  }),
  make({
    name: 'サイバーエージェント',
    industry: 'IT・通信',
    type: 'インターン',
    title: 'DIG 事業立案インターン',
    status: '面接予定',
    memo: '面接前にABEMAの最新施策をチェック。',
    mypageUrl: 'https://mypage.example.com/ca',
    loginId: 'taro.shukatsu@example.com',
    flowLabels: ['ES', '面接', '参加'],
    currentIndex: 1,
    schedules: [
      { id: uid(), type: '選考面接', date: offsetIso(0, 16, 0), place: 'オンライン', url: 'https://meet.example.com/ca-dig', memo: '私服OK。逆質問の時間が長めらしい。' },
    ],
    deadlines: [],
    esEntries: [
      { id: uid(), question: 'あなたが最近面白いと感じたサービスとその理由は？', answer: 'BeRealです。「盛らない」という制約が逆に投稿のハードルを下げ…', limit: 200, submittedAt: offsetIso(-12) },
    ],
    interviews: [],
    internshipPeriods: [
      { id: uid(), label: 'DIGコース', startDate: offsetIso(17), endDate: offsetIso(21) },
    ],
  }),
  make({
    name: 'トヨタ自動車',
    industry: 'メーカー',
    type: 'インターン',
    title: '事務系1day仕事体験',
    status: '応募予定',
    memo: 'マイページ登録済み。応募開始は来週から。',
    mypageUrl: 'https://mypage.example.com/toyota',
    loginId: 'taro.shukatsu@example.com',
    flowLabels: ['応募', 'ES', '抽選', '参加'],
    currentIndex: 0,
    schedules: [],
    deadlines: [{ id: uid(), label: '応募締切', date: offsetIso(9, 17, 0) }],
    esEntries: [],
    interviews: [],
  }),
  make({
    name: '日本IBM',
    industry: 'IT・通信',
    type: '本選考',
    title: 'ITスペシャリスト',
    status: 'Webテスト結果待ち',
    memo: '',
    mypageUrl: 'https://mypage.example.com/ibm',
    loginId: 'taro.shukatsu@example.com',
    flowLabels: ['ES', 'Webテスト', '一次面接', '最終面接', '内定'],
    currentIndex: 1,
    schedules: [],
    deadlines: [],
    esEntries: [
      { id: uid(), question: 'ITを活用して解決したい社会課題を教えてください。', answer: '地方医療の人材不足です。', limit: 300, submittedAt: offsetIso(-11) },
    ],
    interviews: [],
  }),
  make({
    name: '味の素',
    industry: '食品',
    type: '本選考',
    title: 'セールスコース',
    status: '内定',
    memo: '承諾期限は今月末。他社と比較検討中。',
    mypageUrl: 'https://mypage.example.com/ajinomoto',
    loginId: 'taro.shukatsu@example.com',
    flowLabels: ['ES', 'Webテスト', '一次面接', '最終面接', '内定'],
    currentIndex: 4,
    schedules: [
      { id: uid(), type: '内定者面談', date: offsetIso(12, 15, 0), place: '本社（京橋）', memo: '処遇や配属の質問をまとめておく。' },
    ],
    deadlines: [{ id: uid(), label: '内定承諾締切', date: offsetIso(24, 23, 59) }],
    esEntries: [
      { id: uid(), question: '食を通じて実現したいことを教えてください。', answer: '「おいしさ」を軸にした健康寿命の延伸に貢献したい。', limit: 400, submittedAt: offsetIso(-70) },
    ],
    interviews: [
      { id: uid(), date: offsetIso(-30), qas: [{ question: '営業として大切にしたいことは？', answer: '相手の課題を先回りして考える姿勢、と回答。' }], reflection: '和やかな雰囲気で話せた。', improvement: '—' },
    ],
    research: {
      事業内容: { url: '', summary: 'アミノサイエンスで社会課題解決。営業は量販店向けの提案営業が中心。', memo: '' },
    },
  }),
  make({
    name: '富士通',
    industry: 'IT・通信',
    type: 'インターン',
    title: 'SE職 2週間インターン',
    status: 'ES提出中',
    memo: 'ガクチカを楽天のESから流用できそう。',
    mypageUrl: 'https://mypage.example.com/fujitsu',
    loginId: 'taro.shukatsu@example.com',
    flowLabels: ['ES', '面接', '参加'],
    currentIndex: 0,
    schedules: [],
    deadlines: [{ id: uid(), label: 'ES提出締切', date: offsetIso(7, 23, 59) }],
    esEntries: [],
    interviews: [],
  }),
  make({
    name: 'アクセンチュア',
    industry: 'コンサル',
    type: '本選考',
    title: 'ビジネスコンサルタント',
    status: '不合格',
    memo: 'ケース面接で構造化が甘かった。次に活かす。',
    mypageUrl: 'https://mypage.example.com/acn',
    loginId: 'taro.shukatsu@example.com',
    flowLabels: ['ES', 'Webテスト', '一次面接', '最終面接', '内定'],
    currentIndex: 2,
    schedules: [],
    deadlines: [],
    esEntries: [
      { id: uid(), question: 'あなたが変革したいものは何ですか。', answer: '大学のアナログな履修登録システム。', limit: 300, submittedAt: offsetIso(-55) },
    ],
    interviews: [
      { id: uid(), date: offsetIso(-35), qas: [{ question: '（ケース）国内のコンビニコーヒーの市場規模は？', answer: '店舗数×日販杯数で概算。単価の置き方を突っ込まれた。' }], reflection: '構造化の切り口が1つしか出せなかった。', improvement: 'ケース問題集を週3問ペースで練習する。' },
    ],
  }),
]
