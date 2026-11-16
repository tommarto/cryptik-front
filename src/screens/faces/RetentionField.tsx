const DEFAULT_DAYS = 30

export function RetentionField({
  value,
  onChange,
}: {
  value: number | null
  onChange: (days: number | null) => void
}) {
  const perpetual = value === null

  return (
    <div>
      <p className="mb-2 text-xs font-medium text-slate-300">Tiempo de guardado en BytePlus</p>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(null)}
          className={`h-8 rounded-lg px-3 text-xs font-medium ring-1 transition-colors ${
            perpetual
              ? 'bg-indigo-600/15 text-indigo-300 ring-indigo-500/30'
              : 'bg-slate-800 text-slate-300 ring-slate-700 hover:bg-slate-700'
          }`}
        >
          Perpetua
        </button>
        <button
          type="button"
          onClick={() => onChange(value ?? DEFAULT_DAYS)}
          className={`h-8 rounded-lg px-3 text-xs font-medium ring-1 transition-colors ${
            !perpetual
              ? 'bg-indigo-600/15 text-indigo-300 ring-indigo-500/30'
              : 'bg-slate-800 text-slate-300 ring-slate-700 hover:bg-slate-700'
          }`}
        >
          Por días
        </button>

        {!perpetual && (
          <label className="flex items-center gap-2 text-xs text-slate-400">
            <input
              type="number"
              min={1}
              max={3650}
              value={value}
              onChange={(event) => {
                const days = Math.round(Number(event.target.value))
                onChange(Number.isFinite(days) && days >= 1 ? Math.min(days, 3650) : 1)
              }}
              className="h-8 w-20 rounded-lg border border-slate-800 bg-slate-950/50 px-2 text-xs text-slate-200 focus:outline-2 focus:outline-indigo-500/50"
            />
            días sin usarse
          </label>
        )}
      </div>
      <p className="mt-1.5 text-[11px] text-slate-600">
        {perpetual
          ? 'Queda en BytePlus hasta que alguien la desincronice a mano.'
          : 'Se desincroniza sola si pasa ese tiempo sin usarse. Cada generación reinicia el plazo.'}
      </p>
    </div>
  )
}
