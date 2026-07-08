import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  daysLeft,
  fmtMD,
  fmtMDT,
  fmtTime,
  isPastDay,
  offsetIso,
  relLabel,
  sameDay,
  startOfToday,
  toInputDate,
  toInputDateTime,
} from './date'

// 「今日」をローカルタイムの 2026-01-15(木) 12:30 に固定する。
// Date はローカルタイムのコンストラクタで生成し、CI（UTC）でも同じ結果になるようにする
const NOW = new Date(2026, 0, 15, 12, 30, 0)

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(NOW)
})
afterEach(() => {
  vi.useRealTimers()
})

describe('startOfToday', () => {
  it('今日の 00:00:00.000 を返す', () => {
    expect(startOfToday().getTime()).toBe(new Date(2026, 0, 15, 0, 0, 0, 0).getTime())
  })
})

describe('offsetIso', () => {
  it('今日基準で日数・時刻をオフセットした ISO 文字列を返す', () => {
    expect(new Date(offsetIso(0, 14, 30)).getTime()).toBe(new Date(2026, 0, 15, 14, 30).getTime())
    expect(new Date(offsetIso(3)).getTime()).toBe(new Date(2026, 0, 18, 0, 0).getTime())
    expect(new Date(offsetIso(-1, 23, 59)).getTime()).toBe(new Date(2026, 0, 14, 23, 59).getTime())
  })
})

describe('fmtMD / fmtTime / fmtMDT', () => {
  it('月/日(曜日) 形式にフォーマットする', () => {
    // 2026-01-01 は木曜日
    expect(fmtMD(new Date(2026, 0, 1).toISOString())).toBe('1/1(木)')
  })
  it('時刻をゼロ埋めの HH:MM でフォーマットする', () => {
    expect(fmtTime(new Date(2026, 0, 1, 9, 5).toISOString())).toBe('09:05')
  })
  it('日付と時刻を結合する', () => {
    expect(fmtMDT(new Date(2026, 0, 1, 9, 5).toISOString())).toBe('1/1(木) 09:05')
  })
})

describe('daysLeft', () => {
  it('今日は 0、明日は 1、昨日は -1 を返す（時刻は無視される）', () => {
    expect(daysLeft(new Date(2026, 0, 15, 23, 59).toISOString())).toBe(0)
    expect(daysLeft(new Date(2026, 0, 16, 0, 0).toISOString())).toBe(1)
    expect(daysLeft(new Date(2026, 0, 14, 23, 59).toISOString())).toBe(-1)
  })
})

describe('relLabel', () => {
  it('残り日数に応じたラベルを返す', () => {
    expect(relLabel(new Date(2026, 0, 15).toISOString())).toBe('今日')
    expect(relLabel(new Date(2026, 0, 16).toISOString())).toBe('明日')
    expect(relLabel(new Date(2026, 0, 20).toISOString())).toBe('あと5日')
    expect(relLabel(new Date(2026, 0, 14).toISOString())).toBe('終了')
  })
})

describe('isPastDay', () => {
  it('昨日以前だけを過去と判定する（今日は過去でない）', () => {
    expect(isPastDay(new Date(2026, 0, 14).toISOString())).toBe(true)
    expect(isPastDay(new Date(2026, 0, 15, 0, 0).toISOString())).toBe(false)
    expect(isPastDay(new Date(2026, 0, 16).toISOString())).toBe(false)
  })
})

describe('sameDay', () => {
  it('時刻が違っても同じ日なら true', () => {
    expect(sameDay(new Date(2026, 0, 15, 0, 0), new Date(2026, 0, 15, 23, 59))).toBe(true)
  })
  it('日をまたぐと false', () => {
    expect(sameDay(new Date(2026, 0, 15, 23, 59), new Date(2026, 0, 16, 0, 0))).toBe(false)
  })
})

describe('toInputDateTime / toInputDate', () => {
  it('input[type=datetime-local] / input[type=date] 用の形式に変換する', () => {
    const iso = new Date(2026, 0, 5, 9, 5).toISOString()
    expect(toInputDateTime(iso)).toBe('2026-01-05T09:05')
    expect(toInputDate(iso)).toBe('2026-01-05')
  })
})
