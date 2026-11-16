import { useState } from 'react'
import { CloudUpload, Pencil, ScanFace, Trash2, Unplug, X } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'
import { BadgeTone, ButtonSize, ButtonVariant } from '../../constants/ui'
import { useDeleteFace, useDesyncFace, useSyncFace, useUpdateFace } from '../../hooks/useFaces'
import { FACE_STATUS_LABEL, FaceSyncStatus, type Face } from '../../types/face'
import { RetentionField } from './RetentionField'

const STATUS_TONE: Record<FaceSyncStatus, BadgeTone> = {
  [FaceSyncStatus.Unsynced]: BadgeTone.Neutral,
  [FaceSyncStatus.Queued]: BadgeTone.Warning,
  [FaceSyncStatus.Syncing]: BadgeTone.Info,
  [FaceSyncStatus.Synced]: BadgeTone.Success,
  [FaceSyncStatus.Failed]: BadgeTone.Danger,
  [FaceSyncStatus.Unsyncing]: BadgeTone.Neutral,
}

function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
}

function detail(face: Face): string | null {
  switch (face.syncStatus) {
    case FaceSyncStatus.Queued:
      return face.queuePosition
        ? `#${face.queuePosition} en la cola · ~${face.etaMinutes} min`
        : 'Esperando turno'
    case FaceSyncStatus.Syncing:
      return 'BytePlus la está validando'
    case FaceSyncStatus.Synced:
      return face.expiresAt ? `Vence el ${shortDate(face.expiresAt)} si no se usa` : 'Perpetua'
    case FaceSyncStatus.Failed:
      return face.syncError
    default:
      return face.lastUsedAt ? `Último uso: ${shortDate(face.lastUsedAt)}` : null
  }
}

export function FaceCard({
  face,
  quotaFull,
  onError,
}: {
  face: Face
  quotaFull: boolean
  onError: (message: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(face.name)
  const [retentionDays, setRetentionDays] = useState<number | null>(face.retentionDays)

  const syncFace = useSyncFace()
  const desyncFace = useDesyncFace()
  const updateFace = useUpdateFace()
  const deleteFace = useDeleteFace()
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const busy = syncFace.isPending || desyncFace.isPending || deleteFace.isPending
  const canDelete =
    !face.inUse &&
    face.syncStatus !== FaceSyncStatus.Syncing &&
    face.syncStatus !== FaceSyncStatus.Unsyncing

  async function run(action: () => Promise<unknown>) {
    try {
      await action()
    } catch (cause) {
      onError(cause instanceof Error ? cause.message : 'No se pudo completar la acción.')
    }
  }

  async function save() {
    await run(async () => {
      await updateFace.mutateAsync({ faceId: face.id, name, retentionDays })
      setEditing(false)
    })
  }

  const canSync = face.syncStatus === FaceSyncStatus.Unsynced || face.syncStatus === FaceSyncStatus.Failed
  const canDesync =
    face.syncStatus === FaceSyncStatus.Synced ||
    face.syncStatus === FaceSyncStatus.Queued
  const info = detail(face)

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60">
      <div className="relative aspect-[3/4] bg-slate-950">
        {face.thumbnailUrl ? (
          <img
            src={face.thumbnailUrl}
            alt={face.name}
            loading="lazy"
            className={`size-full object-cover ${
              face.syncStatus === FaceSyncStatus.Synced ? '' : 'opacity-60 grayscale-[40%]'
            }`}
          />
        ) : (
          <span className="flex size-full items-center justify-center text-slate-700">
            <ScanFace className="size-8" />
          </span>
        )}

        <span className="absolute left-2 top-2">
          <Badge tone={STATUS_TONE[face.syncStatus]}>{FACE_STATUS_LABEL[face.syncStatus]}</Badge>
        </span>

        <button
          type="button"
          onClick={() => {
            setName(face.name)
            setRetentionDays(face.retentionDays)
            setConfirmingDelete(false)
            setEditing((value) => !value)
          }}
          aria-label="Editar"
          title="Editar nombre y tiempo de guardado"
          className="absolute right-2 top-2 rounded-md bg-slate-950/80 p-1.5 text-slate-300 ring-1 ring-slate-700 transition-colors hover:text-white"
        >
          {editing ? <X className="size-3.5" /> : <Pencil className="size-3.5" />}
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        {editing ? (
          <form
            onSubmit={(event) => {
              event.preventDefault()
              void save()
            }}
            className="flex flex-col gap-3"
          >
            <input
              autoFocus
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={60}
              className="h-8 rounded-lg border border-slate-800 bg-slate-950/50 px-2 text-xs text-slate-200 focus:outline-2 focus:outline-indigo-500/50"
            />
            <RetentionField value={retentionDays} onChange={setRetentionDays} />
            <Button type="submit" size={ButtonSize.Sm} disabled={!name.trim() || updateFace.isPending}>
              Guardar
            </Button>

            <div className="border-t border-slate-800 pt-3">
              {confirmingDelete ? (
                <div className="flex flex-col gap-2">
                  <p className="text-[11px] text-red-300">
                    Se saca de BytePlus y se borra la imagen. No se puede deshacer.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void run(() => deleteFace.mutateAsync(face.id))}
                      className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-600 px-3 text-xs font-medium text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deleteFace.isPending ? <Spinner className="size-3.5" /> : <Trash2 className="size-3.5" />}
                      Eliminar
                    </button>
                    <Button
                      type="button"
                      size={ButtonSize.Sm}
                      variant={ButtonVariant.Ghost}
                      disabled={deleteFace.isPending}
                      onClick={() => setConfirmingDelete(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  type="button"
                  size={ButtonSize.Sm}
                  variant={ButtonVariant.Ghost}
                  className="w-full text-red-300 hover:text-red-200"
                  disabled={!canDelete || busy}
                  title={
                    face.inUse
                      ? 'Hay generaciones en curso que la usan'
                      : canDelete
                        ? undefined
                        : 'Esperá a que termine de subirse o bajarse de BytePlus'
                  }
                  icon={<Trash2 className="size-3.5" />}
                  onClick={() => setConfirmingDelete(true)}
                >
                  Eliminar cara
                </Button>
              )}
            </div>
          </form>
        ) : (
          <>
            <p className="truncate text-sm font-medium text-slate-100" title={face.name}>
              {face.name}
            </p>
            {info && (
              <p
                className={`line-clamp-2 text-[11px] ${
                  face.syncStatus === FaceSyncStatus.Failed ? 'text-red-300' : 'text-slate-500'
                }`}
                title={info}
              >
                {info}
              </p>
            )}

            <div className="mt-auto pt-1">
              {canSync && (
                <Button
                  size={ButtonSize.Sm}
                  className="w-full"
                  icon={busy ? <Spinner className="size-3.5" /> : <CloudUpload className="size-3.5" />}
                  disabled={busy || quotaFull}
                  title={quotaFull ? 'No hay lugar en BytePlus' : undefined}
                  onClick={() => void run(() => syncFace.mutateAsync(face.id))}
                >
                  {face.syncStatus === FaceSyncStatus.Failed ? 'Reintentar' : 'Habilitar'}
                </Button>
              )}

              {canDesync && (
                <Button
                  size={ButtonSize.Sm}
                  variant={ButtonVariant.Secondary}
                  className="w-full"
                  icon={busy ? <Spinner className="size-3.5" /> : <Unplug className="size-3.5" />}
                  disabled={busy || face.inUse}
                  title={face.inUse ? 'Hay generaciones en curso que la usan' : undefined}
                  onClick={() => void run(() => desyncFace.mutateAsync(face.id))}
                >
                  {face.syncStatus === FaceSyncStatus.Queued ? 'Cancelar' : 'Desincronizar'}
                </Button>
              )}

              {(face.syncStatus === FaceSyncStatus.Syncing ||
                face.syncStatus === FaceSyncStatus.Unsyncing) && (
                <div className="flex h-8 items-center justify-center gap-2 text-xs text-slate-400">
                  <Spinner className="size-3.5" />
                  {FACE_STATUS_LABEL[face.syncStatus]}…
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
