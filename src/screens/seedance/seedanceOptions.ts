
export enum Duration {
  Auto = 'auto',
}

export const MIN_DURATION_SECONDS = 4
export const MAX_DURATION_SECONDS = 30

export type DurationValue = Duration.Auto | number

export enum AspectRatio {
  Adaptive = 'adaptive',
  Landscape = '16:9',
  Portrait = '9:16',
  Classic = '4:3',
  ClassicPortrait = '3:4',
  Square = '1:1',
  Ultrawide = '21:9',
}

export const ASPECT_RATIO_LABEL: Record<AspectRatio, string> = {
  [AspectRatio.Adaptive]: 'Auto',
  [AspectRatio.Landscape]: '16:9',
  [AspectRatio.Portrait]: '9:16',
  [AspectRatio.Classic]: '4:3',
  [AspectRatio.ClassicPortrait]: '3:4',
  [AspectRatio.Square]: '1:1',
  [AspectRatio.Ultrawide]: '21:9',
}

export enum Resolution {
  SD = '480p',
  HD = '720p',
  FullHD = '1080p',
}

export type SeedanceSettings = {
  duration: DurationValue
  aspectRatio: AspectRatio
  resolution: Resolution
}

export const DEFAULT_SETTINGS: SeedanceSettings = {
  duration: Duration.Auto,
  aspectRatio: AspectRatio.Adaptive,
  resolution: Resolution.HD,
}

export function durationLabel(duration: DurationValue) {
  return duration === Duration.Auto ? 'Auto' : `${duration}s`
}

export const MAX_ASSETS_TOTAL = 50

export const MAX_ASSETS_BY_TYPE: Record<string, number> = {
  image: 30,
  video: 10,
  audio: 10,
}

const TYPE_LABEL: Record<string, string> = {
  image: 'imágenes',
  video: 'videos',
  audio: 'audios',
}

export function assetLimitReason(
  counts: Record<string, number>,
  mediaType: string,
): string | null {
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0)
  if (total >= MAX_ASSETS_TOTAL) {
    return `Máximo ${MAX_ASSETS_TOTAL} referencias en total.`
  }

  const limit = MAX_ASSETS_BY_TYPE[mediaType]
  if (limit !== undefined && (counts[mediaType] ?? 0) >= limit) {
    return `Máximo ${limit} ${TYPE_LABEL[mediaType] ?? mediaType}.`
  }

  return null
}

export const FILE_LIMITS: Record<string, { maxBytes: number; label: string }> = {
  image: { maxBytes: 30 * 1024 * 1024, label: '30 MB' },
  video: { maxBytes: 200 * 1024 * 1024, label: '200 MB' },
  audio: { maxBytes: 15 * 1024 * 1024, label: '15 MB' },
}

export const ACCEPTED_UPLOAD_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'video/mp4',
  'video/quicktime',
  'audio/wav',
  'audio/mpeg',
].join(',')

export function fileRejectionReason(file: File): string | null {
  const kind = file.type.startsWith('image/')
    ? 'image'
    : file.type.startsWith('video/')
      ? 'video'
      : file.type.startsWith('audio/')
        ? 'audio'
        : null

  if (!kind) return `"${file.name}": formato no soportado.`

  const limit = FILE_LIMITS[kind]
  if (file.size > limit.maxBytes) {
    return `"${file.name}" supera el máximo de ${limit.label}.`
  }

  return null
}
