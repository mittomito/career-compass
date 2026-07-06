export default function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-line-strong bg-white px-5 py-14 text-center">
      <p className="text-base font-bold text-ink-sub">{title}</p>
      {description && <p className="mt-1 text-sm text-ink-faint">{description}</p>}
    </div>
  )
}
