import { Compass } from 'lucide-react'

export default function BrandMark({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const box = size === 'md' ? 'h-9 w-9 rounded-xl' : 'h-[30px] w-[30px] rounded-lg'
  const icon = size === 'md' ? 19 : 16
  return (
    <span
      className={`inline-flex items-center justify-center text-white ${box}`}
      style={{ background: 'linear-gradient(135deg,#2F6BEF 0%,#6C95F7 100%)' }}
    >
      <Compass size={icon} strokeWidth={2.2} />
    </span>
  )
}
