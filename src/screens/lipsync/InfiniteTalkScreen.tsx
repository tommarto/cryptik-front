import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Spinner } from '../../components/ui/Spinner'
import { Textarea } from '../../components/ui/Textarea'
import { Dropzone } from '../../components/composites/Dropzone'
import { Modal } from '../../components/composites/Modal'
import { GenerationLayout } from '../../components/layout/GenerationLayout'
import {
  ButtonSize,
  ButtonVariant,
  DropzoneVariant,
} from '../../constants/ui'
import { useCreateLipsync } from '../../hooks/useExecutions'
import { MAX_AUDIO_BYTES, MAX_IMAGE_BYTES } from '../../services/workflowService'
import { WorkflowTypeCode } from '../../types/workflow'
import { describeRejection, formatBytes } from '../../utils/file'
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

  const createLipsync = useCreateLipsync()

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
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'Could not start the generation.',
      )
    }
  }

  return (
    <>
      <Modal
        open={docsOpen}
        onClose={() => setDocsOpen(false)}
        title="Cómo funciona el generador de lipsync"
      >
        <LipsyncDocs />
      </Modal>

      <GenerationLayout
        title="Cryptik - Lipsync Tool"
        subtitle="Genera lipsyncs a partir de una imagen, un audio y un prompt."
        headerAction={
          <Button
            variant={ButtonVariant.Secondary}
            size={ButtonSize.Sm}
            className="shrink-0"
            onClick={() => setDocsOpen(true)}
          >
            Documentación
          </Button>
        }
        workflowTypeCode={WorkflowTypeCode.Lipsync}
        showDelay
        emptyQueueMessage="Todavía no generaste nada. Subí una imagen y un audio para empezar."
        error={error}
        onDismissError={() => setError(null)}
        selectedId={selectedId}
        onSelectExecution={setSelectedId}
        footer={
          <>
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
              {createLipsync.isPending && <Spinner className="size-4" />}
            </Button>
          </>
        }
      >
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
          rows={4}
          className="resize-none"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Describe detalladamente el resultado visual esperado. Incluye estilo, iluminación y estado de ánimo..."
        />
      </GenerationLayout>
    </>
  )
}
