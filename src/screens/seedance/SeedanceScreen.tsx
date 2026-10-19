import { useState } from 'react'
import { Clock, Frame, Gem } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { AssetPickerModal } from '../../components/composites/AssetPickerModal'
import { AssetStrip } from '../../components/composites/AssetStrip'
import { PromptWithMentions } from '../../components/composites/PromptWithMentions'
import {
  SettingOption,
  SettingPill,
} from '../../components/composites/SettingPill'
import { GenerationLayout } from '../../components/layout/GenerationLayout'
import { Spinner } from '../../components/ui/Spinner'
import { ButtonVariant } from '../../constants/ui'
import { useCreateSeedance } from '../../hooks/useExecutions'
import {
  WorkflowTypeCode,
  type SeedanceContext,
  type WorkflowExecution,
} from '../../types/workflow'
import { countByType, type LibraryAsset } from '../../types/media'
import { mediaService } from '../../services/mediaService'
import { labelAssets } from '../../utils/assetLabels'
import {
  ASPECT_RATIO_LABEL,
  AspectRatio,
  DEFAULT_SETTINGS,
  Duration,
  MAX_DURATION_SECONDS,
  MAX_ASSETS_TOTAL,
  MIN_DURATION_SECONDS,
  Resolution,
  ACCEPTED_UPLOAD_TYPES,
  assetLimitReason,
  fileRejectionReason,
  Duration as DurationMode,
  durationLabel,
} from './seedanceOptions'

export function SeedanceScreen() {
  const [taskName, setTaskName] = useState('')
  const [prompt, setPrompt] = useState('')
  const [assets, setAssets] = useState<LibraryAsset[]>([])
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const createSeedance = useCreateSeedance()
  const counts = countByType(assets)

  const labeled = labelAssets(assets)

  async function generate() {
    if (!prompt.trim()) return

    setError(null)
    try {
      const execution = await createSeedance.mutateAsync({
        prompt,
        taskName,
        assetMediaIds: assets.map((asset) => asset.id),
        duration:
          settings.duration === DurationMode.Auto ? -1 : settings.duration,
        aspectRatio: settings.aspectRatio,
        resolution: settings.resolution,
      })
      setSelectedId(execution.id)
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'No se pudo iniciar la generación.',
      )
    }
  }

  function toggleAsset(asset: LibraryAsset) {
    setAssets((current) => {
      if (current.some((item) => item.id === asset.id)) {
        return current.filter((item) => item.id !== asset.id)
      }

      const reason = assetLimitReason(countByType(current), asset.mediaType)
      if (reason) {
        setError(reason)
        return current
      }

      return [...current, asset]
    })
  }

  async function load(execution: WorkflowExecution) {
    const context = execution.context as SeedanceContext

    setError(null)
    setTaskName(context.name ?? '')
    setPrompt(context.prompt ?? '')
    setSettings({
      duration: context.duration === -1 ? DurationMode.Auto : (context.duration ?? DEFAULT_SETTINGS.duration),
      aspectRatio: (context.aspect_ratio as AspectRatio) ?? DEFAULT_SETTINGS.aspectRatio,
      resolution: (context.resolution as Resolution) ?? DEFAULT_SETTINGS.resolution,
    })

    try {
      setAssets(await mediaService.byIds(context.asset_media_ids ?? []))
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'No se pudo cargar el contenido.',
      )
    }
  }

  function clear() {
    setTaskName('')
    setPrompt('')
    setAssets([])
    setSettings(DEFAULT_SETTINGS)
    setError(null)
  }

  return (
    <>
      <AssetPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        workflowTypeCode={WorkflowTypeCode.Seedance}
        selectedIds={assets.map((asset) => asset.id)}
        onToggle={toggleAsset}
        disabledReason={(asset) => assetLimitReason(counts, asset.mediaType)}
        acceptedTypes={ACCEPTED_UPLOAD_TYPES}
        fileRejectionReason={fileRejectionReason}
      />

      <GenerationLayout
        title="Cryptik - Seedance 2.5"
        subtitle="Genera video a partir de un prompt y contenido de referencia."
        workflowTypeCode={WorkflowTypeCode.Seedance}
        emptyQueueMessage="Todavía no generaste nada. Escribí un prompt para empezar."
        error={error}
        onDismissError={() => setError(null)}
        selectedId={selectedId}
        onSelectExecution={setSelectedId}
        onLoadExecution={(execution) => void load(execution)}
        footer={
          <>
            <Button
              variant={ButtonVariant.Ghost}
              onClick={clear}
              disabled={createSeedance.isPending}
            >
              Limpiar
            </Button>
            <Button
              onClick={generate}
              disabled={!prompt.trim() || createSeedance.isPending}
            >
              {createSeedance.isPending ? 'Encolando…' : 'Generar →'}
              {createSeedance.isPending && <Spinner className="size-4" />}
            </Button>
          </>
        }
      >
        <Input
          label="Nombre"
          value={taskName}
          onChange={(event) => setTaskName(event.target.value)}
          placeholder="Opcional — con qué nombre querés encontrarlo después"
          maxLength={120}
        />

        <AssetStrip
          assets={labeled}
          total={MAX_ASSETS_TOTAL}
          onAdd={() => setPickerOpen(true)}
          onRemove={(assetId) =>
            setAssets((current) =>
              current.filter((asset) => asset.id !== assetId),
            )
          }
        />

        <PromptWithMentions
          label="Prompt"
          value={prompt}
          onChange={setPrompt}
          assets={labeled}
          placeholder="Describí la escena: qué pasa, con qué encuadre, con qué luz y en qué estilo..."
        />

        <div className="grid grid-cols-3 gap-2">
          <SettingPill
            icon={<Clock className="size-3.5" />}
            value={durationLabel(settings.duration)}
            label="Duración"
          >
            {() => (
              <div className="w-56 max-w-[70vw] p-2">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs text-slate-300">Duración</span>
                  <span className="font-mono text-xs text-slate-400">
                    {durationLabel(settings.duration)}
                  </span>
                </div>

                <input
                  type="range"
                  min={MIN_DURATION_SECONDS}
                  max={MAX_DURATION_SECONDS}
                  step={1}
                  value={
                    settings.duration === Duration.Auto
                      ? MIN_DURATION_SECONDS
                      : settings.duration
                  }
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      duration: Number(event.target.value),
                    }))
                  }
                  aria-label="Segundos"
                  className="h-1 w-full cursor-pointer accent-indigo-500"
                />

                <SettingOption
                  label="Auto"
                  selected={settings.duration === Duration.Auto}
                  onSelect={() =>
                    setSettings((current) => ({
                      ...current,
                      duration: Duration.Auto,
                    }))
                  }
                />
              </div>
            )}
          </SettingPill>

          <SettingPill
            icon={<Frame className="size-3.5" />}
            value={ASPECT_RATIO_LABEL[settings.aspectRatio]}
            label="Formato"
          >
            {(close) => (
              <div className="max-h-56 w-full overflow-y-auto">
                {Object.values(AspectRatio).map((ratio) => (
                  <SettingOption
                    key={ratio}
                    label={ASPECT_RATIO_LABEL[ratio]}
                    selected={settings.aspectRatio === ratio}
                    onSelect={() => {
                      setSettings((current) => ({
                        ...current,
                        aspectRatio: ratio,
                      }))
                      close()
                    }}
                  />
                ))}
              </div>
            )}
          </SettingPill>

          <SettingPill
            icon={<Gem className="size-3.5" />}
            value={settings.resolution}
            label="Calidad"
          >
            {(close) => (
              <div className="w-full">
                {Object.values(Resolution).map((resolution) => (
                  <SettingOption
                    key={resolution}
                    label={resolution}
                    selected={settings.resolution === resolution}
                    onSelect={() => {
                      setSettings((current) => ({ ...current, resolution }))
                      close()
                    }}
                  />
                ))}
              </div>
            )}
          </SettingPill>
        </div>
      </GenerationLayout>
    </>
  )
}
