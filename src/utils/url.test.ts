import { describe, expect, it } from 'vitest'
import { safeExternalHref } from './url'

describe('safeExternalHref', () => {
  it('http / https の URL はそのまま返す', () => {
    expect(safeExternalHref('https://example.com/mypage')).toBe('https://example.com/mypage')
    expect(safeExternalHref('http://example.com')).toBe('http://example.com')
    expect(safeExternalHref('https://example.com/path?q=1#hash')).toBe(
      'https://example.com/path?q=1#hash',
    )
  })

  it('javascript: などの危険なスキームは undefined を返す', () => {
    expect(safeExternalHref('javascript:alert(1)')).toBeUndefined()
    expect(safeExternalHref('JavaScript:alert(1)')).toBeUndefined()
    expect(safeExternalHref('data:text/html,<script>alert(1)</script>')).toBeUndefined()
    expect(safeExternalHref('vbscript:msgbox(1)')).toBeUndefined()
    expect(safeExternalHref('file:///etc/passwd')).toBeUndefined()
  })

  it('URL として解釈できない文字列は undefined を返す', () => {
    expect(safeExternalHref('')).toBeUndefined()
    expect(safeExternalHref('example.com')).toBeUndefined()
    expect(safeExternalHref('メモ書き')).toBeUndefined()
  })
})
