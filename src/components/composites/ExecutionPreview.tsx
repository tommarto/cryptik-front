import { Download, Loader2, Sparkles, TriangleAlert } from 'lucide-react'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Spinner } from '../ui/Spinner'
import { ButtonSize, ButtonVariant } from '../../constants/ui'
import { useElapsed } from '../../hooks/useElapsed'
import { useVideoUrl } from '../../hooks/useVideoUrl'
import { DownloadState, useVideoDownload } from '../../hooks/useVideoDownload'
import { ExecutionStatus, type WorkflowExecution } from '../../types/workflow'
import { formatElapsed } from '../../utils/time'

export function ExecutionPreview({
  execution,
  className,
}: {
  execution: WorkflowExecution
  className?: string
}) {
  const elapsed = useElapsed(execution.startedAt, execution.finishedAt)
  const isDone = execution.status === ExecutionStatus.Completed
  const { data: videoUrl, isPending: loadingUrl } = useVideoUrl(
    execution.id,
    isDone && Boolean(execution.context.s3_path),
  )

  return (
    <Card
      title={`#${execution.id.slice(0, 8)} · Vista Previa`}
      action={isDone && videoUrl ? <DownloadAction executionId={execution.id} /> : undefined}
      className={className}
      bodyClassName="p-0"
    >
      <div
        className={`flex h-full flex-col items-center justify-center bg-slate-950/40 text-center ${
          isDone && videoUrl ? '' : 'px-6 py-10'
        }`}
      >
        {execution.status === ExecutionStatus.Error ? (
          <>
            <p className="text-sm font-medium text-red-300">La generación falló</p>
            <p className="mt-2 max-w-sm text-xs text-slate-500">
              {execution.errorMessage ?? 'El proveedor no devolvió un detalle.'}
            </p>
          </>
        ) : isDone ? (
          loadingUrl ? (
            <Spinner />
          ) : videoUrl ? (
            <video
              src={videoUrl}
              controls
              className="max-h-full max-w-full rounded-lg object-contain"
            />
          ) : (
            <p className="text-xs text-slate-500">No se pudo cargar el video.</p>
          )
        ) : (
          <>
            <Spinner>
              <Sparkles className="size-5 text-indigo-400" />
            </Spinner>

            <p className="mt-4 text-sm font-medium text-slate-200">
              Generando Contenido...
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Sintetizando audio y renderizando frames
            </p>

            <p className="mt-5 font-mono text-lg text-slate-300">
              {formatElapsed(elapsed)}
            </p>
            <p className="text-[11px] text-slate-600">Tiempo transcurrido</p>
          </>
        )}
      </div>
    </Card>
  )
}

function DownloadAction({ executionId }: { executionId: string }) {
  const { download, state } = useVideoDownload(executionId)

  const Icon =
    state === DownloadState.Loading
      ? Loader2
      : state === DownloadState.Error
        ? TriangleAlert
        : Download

  return (
    <Button
      variant={ButtonVariant.Ghost}
      size={ButtonSize.Icon}
      aria-label="Descargar video"
      title={
        state === DownloadState.Error
          ? 'No se pudo descargar. Reintentar.'
          : 'Descargar'
      }
      onClick={() => void download()}
      icon={
        <Icon
          className={`size-4 ${state === DownloadState.Loading ? 'animate-spin' : ''} ${
            state === DownloadState.Error ? 'text-red-300' : ''
          }`}
        />
      }
    />
  )
}
