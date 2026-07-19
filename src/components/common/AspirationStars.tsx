import { Star } from 'lucide-react'

interface Props {
  /** 志望度（1〜5）。0（未設定）のときの表示は呼び出し側で出し分ける */
  value: number
  size?: number
  /** false にすると塗りつぶしの星だけを表示する（一覧カードなど省スペース向け） */
  showEmpty?: boolean
}

/** 志望度の星表示（読み取り専用） */
export default function AspirationStars({ value, size = 13, showEmpty = true }: Props) {
  const count = showEmpty ? 5 : Math.min(value, 5)
  return (
    <span
      className="inline-flex shrink-0 items-center gap-0.5"
      role="img"
      aria-label={`志望度 ${value} / 5`}
      title={`志望度 ${value} / 5`}
    >
      {Array.from({ length: count }, (_, i) => (
        <Star
          key={i}
          size={size}
          strokeWidth={1.5}
          color={i < value ? '#D9A400' : '#D3DCE9'}
          fill={i < value ? '#D9A400' : 'none'}
        />
      ))}
    </span>
  )
}
