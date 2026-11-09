import type { MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, Loader2, Play, RotateCcw, TriangleAlert } from 'lucide-react'
import { AppRoutes } from '../../config/routes'
import { Badge } from '../../components/ui/Badge'
import { BadgeTone } from '../../constants/ui'
import { DownloadState, useVideoDownload } from '../../hooks/useVideoDownload'
import type { GalleryUser } from '../../services/galleryService'
import {
  ExecutionStatus,
  WorkflowTypeCode,
  type ReuseExecutionState,
  type WorkflowExecution,
} from '../../types/workflow'

const STATUS = {
  [ExecutionStatus.Queued]: { label: 'En cola', tone: BadgeTone.Warning },
  [ExecutionStatus.Processing]: { label: 'En proceso', tone: BadgeTone.Info },
  [ExecutionStatus.Completed]: { label: 'Listo', tone: BadgeTone.Success },
  [ExecutionStatus.Error]: { label: 'Error', tone: BadgeTone.Danger },
} as const

/**
 * Lo que se dibuja encima de cada celda. El layout y la imagen los pone
 * `RowsPhotoAlbum`; esto se monta arriba sin afectar las medidas.
 */
export function GalleryOverlay({
  execution,
  author,
}: {
  execution: WorkflowExecution
  author?: GalleryUser
}) {
  const status = STATUS[execution.status]
  const playable = execution.status === ExecutionStatus.Completed
  const reusable = execution.workflowTypeCode === WorkflowTypeCode.Seedance

  return (
    <div className="pointer-events-none absolute inset-0">
      {playable && (
        <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:bg-slate-950/40 group-hover:opacity-100">
          <Play className="size-8 text-white" fill="currentColor" />
        </span>
      )}

      {author && (
        <span className="absolute left-1.5 top-1.5" title={author.name}>
          {author.avatarUrl ? (
            <img
              src={author.avatarUrl}
              alt={author.name}
              className="size-6 rounded-full ring-2 ring-slate-950/50"
            />
          ) : (
            <span className="flex size-6 items-center justify-center rounded-full bg-slate-800 text-[10px] font-medium text-slate-300 ring-2 ring-slate-950/50">
              {author.name.charAt(0).toUpperCase()}
            </span>
          )}
        </span>
      )}

      {execution.context.name && (
        <span className="absolute inset-x-0 bottom-0 block truncate bg-gradient-to-t from-slate-950/90 to-transparent px-2 pb-7 pt-6 text-[11px] text-slate-200">
          {execution.context.name}
        </span>
      )}

      <span className="absolute bottom-1.5 right-1.5 flex items-center gap-1.5">
        {reusable && <ReuseButton execution={execution} />}
        {playable && <DownloadButton executionId={execution.id} />}
        <Badge tone={status.tone}>{status.label}</Badge>
      </span>
    </div>
  )
}

/** Píldora sobre la miniatura. La lógica de la descarga vive en el hook. */
function DownloadButton({ executionId }: { executionId: string }) {
  const { download, state } = useVideoDownload(executionId)

  function handleClick(event: MouseEvent) {
    // La celda entera abre el reproductor: sin esto, bajar el video también
    // abriría el modal.
    event.stopPropagation()
    void download()
  }

  const Icon =
    state === DownloadState.Loading
      ? Loader2
      : state === DownloadState.Error
        ? TriangleAlert
        : Download

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Descargar video"
      title={
        state === DownloadState.Error
          ? 'No se pudo descargar. Reintentar.'
          : 'Descargar'
      }
      className={`pointer-events-auto rounded-md p-1 ring-1 ring-inset transition-colors ${
        state === DownloadState.Error
          ? 'bg-red-500/10 text-red-300 ring-red-500/30'
          : 'bg-slate-900/80 text-slate-300 ring-slate-700 hover:bg-slate-800 hover:text-slate-100'
      }`}
    >
      <Icon
        className={`size-3.5 ${state === DownloadState.Loading ? 'animate-spin' : ''}`}
      />
    </button>
  )
}

function ReuseButton({ execution }: { execution: WorkflowExecution }) {
  const navigate = useNavigate()

  function handleClick(event: MouseEvent) {
    event.stopPropagation()
    const state: ReuseExecutionState = { reuseExecution: execution }
    void navigate(AppRoutes.Seedance, { state })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Volver a generar con esta configuración"
      title="Volver a generar con esta configuración"
      className="pointer-events-auto rounded-md bg-slate-900/80 p-1 text-slate-300 ring-1 ring-inset ring-slate-700 transition-colors hover:bg-slate-800 hover:text-slate-100"
    >
      <RotateCcw className="size-3.5" />
    </button>
  )
}
