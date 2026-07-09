/**
 * ユーザーが入力した URL を外部リンクの href に使ってよい場合のみ返す。
 * javascript: などの危険なスキームや URL として解釈できない文字列は
 * undefined を返し、呼び出し側はリンク化せずプレーンテキスト表示する。
 */
export function safeExternalHref(raw: string): string | undefined {
  try {
    const url = new URL(raw)
    return url.protocol === 'http:' || url.protocol === 'https:' ? raw : undefined
  } catch {
    return undefined
  }
}
