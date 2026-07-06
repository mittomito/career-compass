import type { ReactNode } from 'react'

interface Props {
  title: string
  count?: number
  action?: ReactNode
  children: ReactNode
}

export default function SectionCard({ title, count, action, children }: Props) {
  return (
    <section className="card mb-4 px-6 py-5">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <h3 className="text-base font-extrabold">{title}</h3>
        {count !== undefined && (
          <span className="rounded-full bg-brand-soft px-2.5 py-px text-xs font-bold text-brand">
            {count}
          </span>
        )}
        {action && <div className="ml-auto">{action}</div>}
      </div>
      {children}
    </section>
  )
}
