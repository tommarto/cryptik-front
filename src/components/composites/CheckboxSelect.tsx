import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'

export type CheckboxOption<T extends string> = {
  value: T
  label: string
}

type CheckboxSelectProps<T extends string> = {
  label: string
  options: CheckboxOption<T>[]
  selected: T[]
  onChange: (selected: T[]) => void
}

/**
 * Desplegable con selección múltiple. Se cierra con Escape o al hacer click
 * afuera — sin eso queda abierto para siempre en cuanto el usuario mira otra
 * parte de la pantalla.
 */
export function CheckboxSelect<T extends string>({
  label,
  options,
  selected,
  onChange,
}: CheckboxSelectProps<T>) {
  const [open, setOpen] = useState(false)
  const container = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    function onPointerDown(event: MouseEvent) {
      if (!container.current?.contains(event.target as Node)) setOpen(false)
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  function toggle(value: T) {
    onChange(
      selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value],
    )
  }

  const summary =
    selected.length === 0 || selected.length === options.length
      ? 'Todos'
      : options
          .filter((option) => selected.includes(option.value))
          .map((option) => option.label)
          .join(', ')

  return (
    <div ref={container} className="relative">
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        aria-expanded={open}
        className="flex h-8 items-center gap-2 rounded-lg bg-slate-800 px-3 text-xs text-slate-200 ring-1 ring-slate-700 transition-colors hover:bg-slate-700"
      >
        <span className="text-slate-500">{label}</span>
        <span className="max-w-40 truncate">{summary}</span>
        <ChevronDown className="size-3.5 text-slate-500" />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-lg border border-slate-800 bg-slate-900 py-1 shadow-xl">
          {options.map((option) => {
            const checked = selected.includes(option.value)

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggle(option.value)}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-slate-300 transition-colors hover:bg-slate-800"
              >
                <span
                  className={`flex size-3.5 shrink-0 items-center justify-center rounded border ${
                    checked
                      ? 'border-indigo-500 bg-indigo-500 text-white'
                      : 'border-slate-600'
                  }`}
                >
                  {checked && <Check className="size-2.5" strokeWidth={3} />}
                </span>
                {option.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
