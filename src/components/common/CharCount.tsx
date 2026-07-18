/**
 * 入力欄の下に添える文字数カウンタ。maxLength とセットで使う。
 * 上限に達したときだけ目立たせる（普段は控えめに出す）。
 */
export default function CharCount({ value, max }: { value: string; max: number }) {
  const reached = value.length >= max
  return (
    <p
      className={`mt-1 text-right text-xs ${reached ? 'font-bold text-danger' : 'text-ink-faint'}`}
    >
      {value.length} / {max}字{reached && '（上限）'}
    </p>
  )
}
