import { Plus, X } from 'lucide-react'
import type { LabeledAsset } from '../../utils/assetLabels'
import { ASSET_ICON } from './assetIcons'

export function AssetStrip({
  assets,
  total,
  onAdd,
  onRemove,
}: {
  assets: LabeledAsset[]
  total: number
  onAdd: () => void
  onRemove: (assetId: string) => void
}) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <p className="text-xs font-medium text-slate-300">Contenido</p>
        <span className="font-mono text-[11px] text-slate-600">
          {assets.length}/{total}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 rounded-lg border border-slate-800 bg-slate-950/30 p-2">
        {assets.map((asset) => (
          <AssetTile key={asset.id} asset={asset} onRemove={onRemove} />
        ))}

        <button
          type="button"
          onClick={onAdd}
          aria-label="Agregar contenido"
          title="Agregar contenido"
          className="flex size-16 shrink-0 items-center justify-center rounded-md border border-dashed border-slate-700 text-slate-500 transition-colors hover:border-indigo-500 hover:text-indigo-400"
        >
          <Plus className="size-4" />
        </button>
      </div>

      {assets.length === 0 && (
        <p className="mt-1.5 text-[11px] text-slate-600">
          Imágenes, videos o audios de referencia. Cada uno queda como
          <span className="mx-1 font-mono text-slate-500">@imagen-1</span>,
          <span className="mx-1 font-mono text-slate-500">@video-1</span> y así,
          según el orden en que los agregues.
        </p>
      )}
    </div>
  )
}

function AssetTile({
  asset,
  onRemove,
}: {
  asset: LabeledAsset
  onRemove: (assetId: string) => void
}) {
  const Fallback = ASSET_ICON[asset.mediaType]

  return (
    <div
      className="group relative size-16 shrink-0 overflow-hidden rounded-md bg-slate-900 ring-1 ring-slate-800"
      title={`Mencionalo como @${asset.label}`}
    >
      {asset.thumbnailUrl ? (
        <img
          src={asset.thumbnailUrl}
          alt={asset.label}
          className="size-full object-cover"
        />
      ) : (
        <span className="flex size-full items-center justify-center text-slate-600">
          <Fallback className="size-5" />
        </span>
      )}

      <span className="absolute inset-x-0 bottom-0 truncate bg-slate-950/85 px-1 py-0.5 text-center font-mono text-[9px] text-slate-300">
        {asset.label}
      </span>

      <button
        type="button"
        onClick={() => onRemove(asset.id)}
        aria-label={`Quitar ${asset.label}`}
        className="absolute right-0.5 top-0.5 rounded bg-slate-950/80 p-0.5 text-slate-300 opacity-0 transition-opacity hover:text-white group-hover:opacity-100"
      >
        <X className="size-3" />
      </button>
    </div>
  )
}
