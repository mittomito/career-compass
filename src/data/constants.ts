import type { CompanyStatus, EventKind } from '../types'

/** ステータスバッジの配色（Tailwind の purge を避けるため hex を直接持つ） */
export const STATUS_STYLES: Record<CompanyStatus, { fg: string; bg: string }> = {
  応募予定: { fg: '#5A6B84', bg: '#EEF2F7' },
  ES提出中: { fg: '#1E4FD6', bg: '#EBF1FE' },
  ES結果待ち: { fg: '#C07C1B', bg: '#FCF3E3' },
  ES通過: { fg: '#0F9B6C', bg: '#E7F6F0' },
  Webテスト: { fg: '#0B8A80', bg: '#E2F4F2' },
  Webテスト結果待ち: { fg: '#C07C1B', bg: '#FCF3E3' },
  面接予定: { fg: '#1E4FD6', bg: '#EBF1FE' },
  面接結果待ち: { fg: '#C07C1B', bg: '#FCF3E3' },
  内定: { fg: '#FFFFFF', bg: '#0F9B6C' },
  不合格: { fg: '#8896AC', bg: '#F1F4F8' },
  辞退: { fg: '#7A6E8E', bg: '#F0EDF6' },
}

/** カレンダー・予定リストの色分け */
export const KIND_STYLES: Record<EventKind, { main: string; fg: string; bg: string }> = {
  ES: { main: '#8B5CF6', fg: '#7C3AED', bg: '#F3EEFE' },
  GD: { main: '#D946A6', fg: '#C02690', bg: '#FCEAF6' },
  動画選考: { main: '#E07A2F', fg: '#C4641D', bg: '#FBEFE3' },
  面接: { main: '#2F6BEF', fg: '#2F6BEF', bg: '#EBF1FE' },
  Webテスト: { main: '#0F9B6C', fg: '#0B8A80', bg: '#E2F4F2' },
  その他: { main: '#D9A400', fg: '#A67E00', bg: '#FBF5DC' },
}

/** 選考フローに追加できるステップのプリセット（自由入力も可能） */
export const FLOW_PRESETS = [
  'ES',
  'Webテスト：SPI',
  'Webテスト：玉手箱',
  'Webテスト：TG-WEB',
  'SPI：テストセンター',
  'GD',
  '一次面接',
  '二次面接',
  '三次面接以降',
  '最終面接',
  '動画',
  '面談',
  'その他',
] as const

export const SCHEDULE_TYPE_PRESETS = [
  '面接',
  'Webテスト',
  'ES',
  'GD',
  '動画選考',
  '説明会',
  '面談',
  'OB・OG訪問',
  'その他',
] as const

/** 敗因タグのプリセット（振り返りタブで自由入力のタグも追加できる） */
export const REJECTION_TAG_PRESETS = [
  'ES',
  'Webテスト',
  'GD',
  '面接(受け答え)',
  '面接(社風・価値観の不一致)',
  '準備不足',
  'その他',
] as const

export const INDUSTRIES = [
  'IT・通信',
  'メーカー',
  '総合商社',
  '金融',
  'コンサル',
  '広告・メディア',
  'インフラ',
  '食品',
  'その他',
] as const

/**
 * インターン期間カレンダーの企業色パレット。
 * 企業の「表示色」の選択肢でもあり、未設定企業への自動割り当てにも使う。
 */
export const COMPANY_COLOR_PALETTE = [
  '#2F6BEF',
  '#0F9B6C',
  '#C07C1B',
  '#8B5CF6',
  '#E2554D',
  '#0B8A80',
  '#D946A6',
  '#D9A400',
  '#E07A2F',
  '#6B7280',
] as const
