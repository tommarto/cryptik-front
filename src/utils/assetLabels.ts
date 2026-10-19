import { MediaType } from '../types/workflow'
import type { LibraryAsset } from '../types/media'


const MENTION_PREFIX: Record<MediaType, string> = {
  [MediaType.Image]: 'imagen',
  [MediaType.Video]: 'video',
  [MediaType.Audio]: 'audio',
}

export type LabeledAsset = LibraryAsset & {
  label: string
}


export function labelAssets(assets: LibraryAsset[]): LabeledAsset[] {
  const counters = new Map<MediaType, number>()

  return assets.map((asset) => {
    const position = (counters.get(asset.mediaType) ?? 0) + 1
    counters.set(asset.mediaType, position)

    return { ...asset, label: `${MENTION_PREFIX[asset.mediaType]}-${position}` }
  })
}
