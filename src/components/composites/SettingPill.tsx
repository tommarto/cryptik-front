import { useRef, useState, type ReactNode } from 'react'
import { Check } from 'lucide-react'
import { useDismiss } from '../../hooks/useDismiss'

type SettingPillProps = {
  icon: ReactNode
  value: string
  label: string
  children: (close: () => void) => ReactNode
}

export function SettingPill({ icon, value, label, children }: SettingPillProps) {
  const [open, setOpen] = useState(false)
  const container = useRef<HTMLDivElement>(null)
  useDismiss(open, container, () => setOpen(false))

  return (
    <div ref={container} className="relative">
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        aria-expanded={open}
        aria-label={label}
        title={label}
        className={`flex h-9 w-full items-center justify-center gap-2 rounded-lg px-3 text-xs font-medium ring-1 transition-colors ${
          open
            ? 'bg-slate-700 text-slate-100 ring-slate-600'
            : 'bg-slate-800 text-slate-200 ring-slate-700 hover:bg-slate-700'
        }`}
      >
        <span className="shrink-0 text-slate-400">{icon}</span>
        {value}
      </button>

      {open && (
        <div className="absolute bottom-full left-0 z-20 mb-2 min-w-full rounded-lg border border-slate-700 bg-slate-900 p-1 shadow-xl">
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  )
}

export function SettingOption({
  label,
  selected,
  onSelect,
}: {
  label: string
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-center justify-between gap-6 rounded-md px-3 py-2 text-left text-xs transition-colors ${
        selected
          ? 'bg-slate-800 text-slate-100'
          : 'text-slate-300 hover:bg-slate-800'
      }`}
    >
      {label}
      {selected && <Check className="size-3.5 shrink-0 text-slate-400" />}
    </button>
  )
}
