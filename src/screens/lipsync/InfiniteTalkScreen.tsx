import { useState } from 'react'
import { Download, Loader2, RefreshCw, Sparkles, TriangleAlert } from 'lucide-react'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Spinner } from '../../components/ui/Spinner'
import { Textarea } from '../../components/ui/Textarea'
import { Dropzone } from '../../components/composites/Dropzone'
import { Modal } from '../../components/composites/Modal'
import {
  AlertVariant,
  ButtonSize,
  ButtonVariant,
  DropzoneVariant,
} from '../../constants/ui'
import { useCreateLipsync, useExecutions } from '../../hooks/useExecutions'
import { useElapsed } from '../../hooks/useElapsed'
import { useVideoUrl } from '../../hooks/useVideoUrl'
import { DownloadState, useVideoDownload } from '../../hooks/useVideoDownload'
import { MAX_AUDIO_BYTES, MAX_IMAGE_BYTES } from '../../services/workflowService'
import { ExecutionStatus, type WorkflowExecution } from '../../types/workflow'
import { describeRejection, formatBytes } from '../../utils/file'
import { formatElapsed } from '../../utils/time'
import {
  EXECUTION_GRID,
  ExecutionCard,
  SECONDARY_COLUMN,
} from './ExecutionCard'
import { LipsyncDocs } from './LipsyncDocs'

const PHASE_LABEL: Record<string, string> = {
  idle: 'Generar →',
  uploading: 'Subiendo archivos…',
  starting: 'Encolando…',
}

export function InfiniteTalkScreen() {
  const [image, setImage] = useState<File | null>(null)
  const [audio, setAudio] = useState<File | null>(null)
  const [taskName, setTaskName] = useState('')
  const [prompt, setPrompt] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [docsOpen, setDocsOpen] = useState(false)

  const { data: executions = [], isPending, isFetching, refetch } = useExecutions()
  const createLipsync = useCreateLipsync()

  const selected =
    executions.find((execution) => execution.id === selectedId) ?? executions[0]

  function clear() {
    setImage(null)
    setAudio(null)
    setTaskName('')
    setPrompt('')
    setError(null)
  }

  async function generate() {
    if (!image || !audio) return

    setError(null)

    try {
      const execution = await createLipsync.mutateAsync({
        image,
        audio,
        prompt,
        taskName,
      })
      setSelectedId(execution.id)
      clear()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not start the generation.')
    }
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col px-4 py-6 sm:px-8 sm:py-8 lg:h-dvh lg:overflow-hidden">
      <Modal
        open={docsOpen}
        onClose={() => setDocsOpen(false)}
        title="Cómo funciona el generador de lipsync"
      >
        <LipsyncDocs />
      </Modal>

      <header className="flex shrink-0 flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-50">
            Cryptik - Lipsync Tool
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Genera lipsyncs a partir de una imagen, un audio y un prompt.
          </p>
        </div>

        <Button
          variant={ButtonVariant.Secondary}
          size={ButtonSize.Sm}
          className="shrink-0"
          onClick={() => setDocsOpen(true)}
        >
          Documentación
        </Button>
      </header>

      {/* `grid-rows-[minmax(0,1fr)]` y no solo `min-h-0` en el contenedor: la
          fila implícita de un grid es `auto`, o sea que se dimensiona por su
          contenido y desborda al padre aunque el padre esté acotado. Con la
          fila fijada a 1fr y mínimo 0, las columnas quedan del alto disponible
          y recién ahí el `overflow-y-auto` de adentro tiene contra qué apretar. */}
      <div className="mt-8 grid gap-6 lg:min-h-0 lg:flex-1 lg:grid-cols-2 lg:grid-rows-[minmax(0,1fr)]">
        <div className="flex flex-col gap-6 lg:min-h-0">
          {error && (
            <Alert
              variant={AlertVariant.Error}
              title="Error de Procesamiento"
              onDismiss={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          {/* `lg:min-h-0` además de `flex-1`: sin eso el `min-height: auto` de un
              ítem flex es el alto de su contenido, así que la card se niega a
              encogerse y desborda la columna en pantallas bajas. Es el mismo
              par que ya tiene la vista previa en la columna derecha. */}
          <Card title="Parámetros de Entrada" className="flex-1 lg:min-h-0">
            <div className="flex h-full min-h-0 flex-1 flex-col gap-4 lg:overflow-y-auto">
              <Input
                label="Nombre"
                value={taskName}
                onChange={(event) => setTaskName(event.target.value)}
                placeholder="Opcional — si lo dejás vacío usamos el nombre del audio"
                maxLength={120}
              />

              <Dropzone
                label="Imagen Base"
                variant={DropzoneVariant.Area}
                placeholder="Arrastrá y soltá tu imagen aquí, o explorá"
                hint={`PNG, JPG o WEBP, hasta ${formatBytes(MAX_IMAGE_BYTES)}.`}
                accept={{
                  'image/png': ['.png'],
                  'image/jpeg': ['.jpg', '.jpeg'],
                  'image/webp': ['.webp'],
                }}
                maxSize={MAX_IMAGE_BYTES}
                file={image}
                onFileAccepted={setImage}
                onFileRejected={(rejection) =>
                  setError(
                    `${describeRejection(rejection, MAX_IMAGE_BYTES)} Se aceptan PNG y JPG.`,
                  )
                }
              />

              <Dropzone
                label="Archivo de Audio"
                variant={DropzoneVariant.Compact}
                placeholder="Seleccionar audio..."
                hint={`MP3, WAV o M4A, hasta ${formatBytes(MAX_AUDIO_BYTES)}.`}
                accept={{ 'audio/*': ['.mp3', '.wav', '.m4a'] }}
                maxSize={MAX_AUDIO_BYTES}
                file={audio}
                onFileAccepted={setAudio}
                onFileRejected={(rejection) =>
                  setError(
                    `${describeRejection(rejection, MAX_AUDIO_BYTES)} Se aceptan MP3, WAV y M4A.`,
                  )
                }
              />

              <Textarea
                label="Prompt de Imagen"
                // Cuatro filas y no siete: en un MacBook 13" el viewport ronda
                // los 700px y con siete el botón de generar no entraba. El
                // prompt largo scrollea adentro del campo.
                rows={4}
                // Contra el `resize: vertical` del preflight de Tailwind: con la
                // página fijada al viewport, agrandar el campo a mano empujaba el
                // botón fuera de pantalla.
                className="resize-none"
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="Describe detalladamente el resultado visual esperado. Incluye estilo, iluminación y estado de ánimo..."
              />

              <div className="mt-auto flex justify-end gap-3">
                <Button
                  variant={ButtonVariant.Ghost}
                  onClick={clear}
                  disabled={createLipsync.isPending}
                >
                  Limpiar
                </Button>
                <Button
                  onClick={generate}
                  disabled={!image || !audio || createLipsync.isPending}
                >
                  {PHASE_LABEL[createLipsync.phase ?? 'idle']}
                  {/* Va como children y no por el prop `icon`, que Button
                      renderiza antes del texto. El `gap` de Button lo separa. */}
                  {createLipsync.isPending && <Spinner className="size-4" />}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-6 lg:min-h-0">
          <Card
            className="lg:h-56"
            title="Cola de Trabajos"
            action={
              <Button
                variant={ButtonVariant.Ghost}
                size={ButtonSize.Icon}
                aria-label="Actualizar cola"
                onClick={() => void refetch()}
                disabled={isFetching}
                icon={
                  <RefreshCw className={`size-4 ${isFetching ? 'animate-spin' : ''}`} />
                }
              />
            }
          >
            {isPending ? (
              <div className="flex h-full items-center justify-center">
                <Spinner className="size-6" />
              </div>
            ) : executions.length === 0 ? (
              <p className="text-xs text-slate-500">
                Todavía no generaste nada. Subí una imagen y un audio para empezar.
              </p>
            ) : (
              <div className="flex h-full flex-col gap-2 overflow-y-auto">
                <div
                  className={`sticky top-0 grid ${EXECUTION_GRID} bg-slate-900/95 px-3 pb-1 text-[10px] font-medium uppercase tracking-wider text-slate-600`}
                >
                  <span className="sm:hidden">Nombre</span>
                  <span className={SECONDARY_COLUMN}>ID</span>
                  <span className="hidden sm:block">Nombre</span>
                  <span>Estado</span>
                  <span className={SECONDARY_COLUMN}>Pedido</span>
                  <span className={SECONDARY_COLUMN}>Espera</span>
                  <span className={SECONDARY_COLUMN}>Ejec.</span>
                </div>

                {executions.map((execution) => (
                  <ExecutionCard
                    key={execution.id}
                    execution={execution}
                    selected={execution.id === selected?.id}
                    onSelect={(picked) => setSelectedId(picked.id)}
                  />
                ))}
              </div>
            )}
          </Card>

          {selected && <ExecutionPreview execution={selected} className="flex-1 lg:min-h-0" />}
        </div>
      </div>
    </div>
  )
}

function ExecutionPreview({
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
      // Solo cuando hay video: antes de eso no hay nada que bajar.
      action={isDone && videoUrl ? <DownloadAction executionId={execution.id} /> : undefined}
      className={className}
      // Sin padding: el video ocupa la card entera. Los otros estados ponen el
      // suyo, que son texto y necesitan aire.
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

/** Botón de descarga del header de la vista previa. Mismo hook que la galería. */
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
