import { Grid2x2, Grid3x3 } from 'lucide-react'

export const MIN_COLUMNS = 4
export const MAX_COLUMNS = 7
export const DEFAULT_COLUMNS = 4

/**
 * Cuántas celdas entran por fila.
 *
 * El slider va al revés que el número de columnas: arrastrar a la derecha
 * agranda las imágenes, que es la convención de cualquier control de zoom, y
 * agrandarlas significa menos columnas. Por eso el valor del input se invierte
 * en vez de mapear directo.
 */
export function ColumnsSlider({
  columns,
  onChange,
}: {
  columns: number
  onChange: (columns: number) => void
}) {
  const position = MIN_COLUMNS + MAX_COLUMNS - columns

  return (
    <div
      className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5"
      title={`${columns} por fila`}
    >
      <Grid3x3 className="size-3.5 shrink-0 text-slate-500" />
      <input
        type="range"
        min={MIN_COLUMNS}
        max={MAX_COLUMNS}
        step={1}
        value={position}
        onChange={(event) =>
          onChange(MIN_COLUMNS + MAX_COLUMNS - Number(event.target.value))
        }
        aria-label="Tamaño de las miniaturas"
        className="h-1 w-24 cursor-pointer accent-indigo-500"
      />
      <Grid2x2 className="size-3.5 shrink-0 text-slate-500" />
    </div>
  )
}
