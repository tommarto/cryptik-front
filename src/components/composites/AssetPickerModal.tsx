import { useRef, useState } from 'react'
import { Check, CloudUpload, Pencil } from 'lucide-react'
import { FaceStatusDot } from './FaceStatusDot'
import { faceKeys, useFaces } from '../../hooks/useFaces'
import { faceNameFromFile, faceService } from '../../services/faceService'
import { FaceSyncStatus } from '../../types/face'
import { useQueryClient } from '@tanstack/react-query'
import { Spinner } from '../ui/Spinner'
import { Modal } from './Modal'
import { ASSET_ICON } from './assetIcons'
import { mediaLibraryKeys, useMediaLibrary } from '../../hooks/useMediaLibrary'
import { mediaService } from '../../services/mediaService'
import { MediaType } from '../../types/workflow'
import {
  AssetKind,
  assetCaption,
  faceAsset,
  type LibraryAsset,
} from '../../types/media'

const FACES_FILTER = 'faces'

type Filter = MediaType | typeof FACES_FILTER | null

const FILTERS: { value: Filter; label: string }[] = [
  { value: null, label: 'Todos' },
  { value: MediaType.Image, label: 'Imagen' },
  { value: MediaType.Video, label: 'Video' },
  { value: MediaType.Audio, label: 'Audio' },
]

const FACES_OPTION: { value: Filter; label: string } = { value: FACES_FILTER, label: 'Caras' }

export function AssetPickerModal({
  open,
  onClose,
  workflowTypeCode,
  selectedIds,
  onToggle,
  disabledReason,
  acceptedTypes,
  fileRejectionReason,
  facesEnabled = false,
}: {
  open: boolean
  onClose: () => void
  workflowTypeCode: string
  selectedIds: string[]
  onToggle: (asset: LibraryAsset) => void
  disabledReason?: (asset: LibraryAsset) => string | null
  acceptedTypes: string
  fileRejectionReason?: (file: File) => string | null
  facesEnabled?: boolean
}) {
  const [filter, setFilter] = useState<Filter>(null)
  const showingFaces = filter === FACES_FILTER
  const [renaming, setRenaming] = useState<LibraryAsset | null>(null)
  const [draftName, setDraftName] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  const library = useMediaLibrary(
    workflowTypeCode,
    filter && filter !== FACES_FILTER ? [filter] : [],
    open && !showingFaces,
  )
  const faceLibrary = useFaces(open && showingFaces)

  const assets: LibraryAsset[] = showingFaces
    ? (faceLibrary.data?.faces ?? []).map(faceAsset)
    : (library.data ?? [])
  const isPending = showingFaces ? faceLibrary.isPending : library.isPending
  const quota = faceLibrary.data?.quota

  async function upload(files: FileList | null) {
    if (!files?.length) return

    setError(null)
    setUploading(true)
    try {
      const rejected = showingFaces
        ? []
        : Array.from(files)
            .map((file) => fileRejectionReason?.(file))
            .filter((reason): reason is string => Boolean(reason))

      if (rejected.length) {
        setError(rejected.join(' '))
        return
      }

      if (showingFaces) {
        for (const file of Array.from(files)) {
          const created = await faceService.create({
            file,
            name: faceNameFromFile(file),
            retentionDays: null,
            sync: true,
          })
          if (created.warning) setError(created.warning)
        }
        await queryClient.invalidateQueries({ queryKey: faceKeys.all })
        return
      }

      for (const file of Array.from(files)) {
        await mediaService.upload(file, workflowTypeCode)
      }
      await queryClient.invalidateQueries({ queryKey: mediaLibraryKeys.all })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo subir.')
    } finally {
      setUploading(false)
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  async function rename() {
    if (!renaming) return

    setError(null)
    try {
      if (renaming.kind === AssetKind.Face) {
        await faceService.update(renaming.id, { name: draftName })
        await queryClient.invalidateQueries({ queryKey: faceKeys.all })
      } else {
        await mediaService.setName(renaming.id, draftName)
        await queryClient.invalidateQueries({ queryKey: mediaLibraryKeys.all })
      }
      setRenaming(null)
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'No se pudo guardar el nombre.',
      )
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Agregar contenido">
      <div className="mb-4 flex flex-wrap gap-2">
        {(facesEnabled ? [...FILTERS, FACES_OPTION] : FILTERS).map((option) => (
          <button
            key={option.label}
            type="button"
            onClick={() => setFilter(option.value)}
            className={`h-8 rounded-lg px-3 text-xs font-medium ring-1 transition-colors ${
              filter === option.value
                ? 'bg-indigo-600/15 text-indigo-300 ring-indigo-500/30'
                : 'bg-slate-800 text-slate-300 ring-slate-700 hover:bg-slate-700'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {showingFaces && (
        <p className="mb-3 text-[11px] text-slate-500">
          Las caras se suben a BytePlus de a 3 por minuto. Podés usar una que
          todavía no esté disponible: la generación espera a que se habilite.
          {quota && (
            <span className="ml-1 font-mono text-slate-400">
              {quota.used}/{quota.limit} en BytePlus
            </span>
          )}
        </p>
      )}

      {error && <p className="mb-3 text-xs text-red-400">{error}</p>}

      {renaming && (
        <form
          onSubmit={(event) => {
            event.preventDefault()
            void rename()
          }}
          className="mb-3 flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 p-2"
        >
          <input
            autoFocus
            value={draftName}
            onChange={(event) => setDraftName(event.target.value)}
            placeholder={renaming.fileName ?? 'Nombre'}
            maxLength={60}
            className="h-8 flex-1 rounded-md border border-slate-800 bg-slate-950/50 px-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-2 focus:outline-indigo-500/50"
          />
          <button
            type="submit"
            className="h-8 rounded-md bg-indigo-600 px-3 text-xs font-medium text-white hover:bg-indigo-500"
          >
            Guardar
          </button>
          <button
            type="button"
            onClick={() => setRenaming(null)}
            className="h-8 rounded-md px-3 text-xs text-slate-400 hover:text-slate-200"
          >
            Cancelar
          </button>
        </form>
      )}

      <div className="grid max-h-[55vh] grid-cols-2 gap-3 overflow-y-auto p-1 sm:grid-cols-4">
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          disabled={uploading}
          className="flex aspect-square flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-700 text-slate-500 transition-colors hover:border-indigo-500 hover:text-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploading ? (
            <Spinner className="size-6" />
          ) : (
            <>
              <CloudUpload className="size-6" />
              <span className="text-xs font-medium">
                {showingFaces ? 'Subir cara' : 'Subir archivo'}
              </span>
            </>
          )}
        </button>

        <input
          ref={fileInput}
          type="file"
          multiple
          accept={showingFaces ? 'image/jpeg,image/png,image/webp' : acceptedTypes}
          className="hidden"
          onChange={(event) => void upload(event.target.files)}
        />

        {isPending
          ? null
          : assets.map((asset) => (
              <AssetOption
                key={asset.id}
                asset={asset}
                selected={selectedIds.includes(asset.id)}
                blocked={
                  selectedIds.includes(asset.id)
                    ? null
                    : (disabledReason?.(asset) ?? null)
                }
                onToggle={() => onToggle(asset)}
                onRename={(picked) => {
                  setRenaming(picked)
                  setDraftName(picked.displayName ?? '')
                }}
              />
            ))}
      </div>

      {isPending && (
        <div className="flex justify-center py-8">
          <Spinner className="size-6" />
        </div>
      )}

      {!isPending && assets.length === 0 && (
        <p className="py-6 text-center text-xs text-slate-500">
          {showingFaces
            ? 'Todavía no hay caras en la biblioteca.'
            : 'Todavía no subiste contenido de este tipo.'}
        </p>
      )}
    </Modal>
  )
}

function uploadedAt(iso: string) {
  return new Date(iso).toLocaleString('es-AR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function AssetOption({
  asset,
  selected,
  blocked,
  onToggle,
  onRename,
}: {
  asset: LibraryAsset
  selected: boolean
  blocked: string | null
  onToggle: () => void
  onRename: (asset: LibraryAsset) => void
}) {
  const Fallback = ASSET_ICON[asset.mediaType]
  const caption = assetCaption(asset)

  return (
    <div className="group relative aspect-square">
      <button
        type="button"
        onClick={onToggle}
        disabled={Boolean(blocked)}
        title={
          blocked ??
          `${caption ?? 'Sin nombre'} · ${uploadedAt(asset.createdAt)}`
        }
        className={`relative size-full overflow-hidden rounded-lg bg-slate-900 ring-2 transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
          selected ? 'ring-indigo-500' : 'ring-transparent hover:ring-slate-700'
        }`}
      >
        {asset.syncStatus && asset.syncStatus !== FaceSyncStatus.Synced && (
          <span className="absolute bottom-6 right-1.5 z-10">
            <FaceStatusDot status={asset.syncStatus} />
          </span>
        )}

        {asset.thumbnailUrl ? (
          <img
            src={asset.thumbnailUrl}
            alt=""
            loading="lazy"
            className="size-full object-cover"
          />
        ) : (
          <span className="flex size-full items-center justify-center text-slate-700">
            <Fallback className="size-7" />
          </span>
        )}

        <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-slate-950/95 to-transparent px-2 pb-1.5 pt-5 text-left text-[10px] text-slate-200">
          {caption ?? uploadedAt(asset.createdAt)}
        </span>

        {selected && (
          <span className="absolute right-1.5 top-1.5 rounded-full bg-indigo-500 p-0.5 text-white">
            <Check className="size-3" />
          </span>
        )}
      </button>

      <button
        type="button"
        onClick={() => onRename(asset)}
        aria-label="Cambiar el nombre"
        title="Cambiar el nombre"
        className="absolute left-1.5 top-1.5 rounded bg-slate-950/80 p-1 text-slate-300 opacity-0 transition-opacity hover:text-white group-hover:opacity-100"
      >
        <Pencil className="size-3" />
      </button>
    </div>
  )
}
