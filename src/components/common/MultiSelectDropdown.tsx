import { Check, ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface Props<T extends string> {
  label: string
  options: readonly T[]
  selected: T[]
  onChange: (next: T[]) => void
}

/** チェックボックス式の複数選択ドロップダウン */
export default function MultiSelectDropdown<T extends string>({
  label,
  options,
  selected,
  onChange,
}: Props<T>) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const toggle = (opt: T) => {
    onChange(selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt])
  }

  const buttonLabel =
    selected.length === 0 ? `${label}：すべて` : `${label}：${selected.length}件選択中`

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="input flex w-auto items-center gap-1.5 py-2 text-sm font-semibold text-ink-sub"
        onClick={() => setOpen((v) => !v)}
      >
        {buttonLabel}
        <ChevronDown size={14} className={`transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-[calc(100%+4px)] z-20 w-56 rounded-xl border border-line bg-white p-2 shadow-lift">
          {selected.length > 0 && (
            <button type="button" className="btn-text mb-1 w-full justify-center" onClick={() => onChange([])}>
              選択をクリア
            </button>
          )}
          <div className="max-h-64 overflow-y-auto">
            {options.map((opt) => {
              const checked = selected.includes(opt)
              return (
                <label
                  key={opt}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-brand-ghost"
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                      checked ? 'border-brand bg-brand text-white' : 'border-line-strong bg-white'
                    }`}
                  >
                    {checked && <Check size={11} strokeWidth={3} />}
                  </span>
                  <input type="checkbox" className="hidden" checked={checked} onChange={() => toggle(opt)} />
                  {opt}
                </label>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}