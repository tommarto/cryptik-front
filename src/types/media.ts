import type { MediaType } from './workflow'

export type LibraryAsset = {
  id: string
  mediaType: MediaType
  fileName: string | null
  displayName: string | null
  thumbnailUrl: string | null
  createdAt: string
}

export function assetCaption(asset: LibraryAsset): string | null {
  return asset.displayName ?? asset.fileName
}

export function countByType(assets: LibraryAsset[]): Record<string, number> {
  return assets.reduce<Record<string, number>>((counts, asset) => {
    counts[asset.mediaType] = (counts[asset.mediaType] ?? 0) + 1
    return counts
  }, {})
}
