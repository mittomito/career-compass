import { STATUS_STYLES } from '../../data/constants'
import type { CompanyStatus } from '../../types'

export default function StatusBadge({ status }: { status: CompanyStatus }) {
  const s = STATUS_STYLES[status]
  return (
    <span
      className="inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-bold"
      style={{ color: s.fg, background: s.bg }}
    >
      {status}
    </span>
  )
}
