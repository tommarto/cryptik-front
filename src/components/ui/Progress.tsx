type ProgressProps = {
  /** 0 a 100. Se recorta si viene fuera de rango. */
  value: number
  /** Texto al pie, a la izquierda (ej. "Estimado: 12s"). */
  hint?: string
  showValue?: boolean
}

export function Progress({ value, hint, showValue = true }: ProgressProps) {
  const percent = Math.min(100, Math.max(0, Math.round(value)))

  return (
    <div>
      <div
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800"
      >
        <div
          className="h-full rounded-full bg-indigo-500 transition-[width] duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>

      {(hint || showValue) && (
        <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
          <span>{hint}</span>
          {showValue && <span>{percent}%</span>}
        </div>
      )}
    </div>
  )
}
