import { MediaType } from './workflow'
import type { Face, FaceSyncStatus } from './face'

export enum AssetKind {
  Media = 'media',
  Face = 'face',
}

export type LibraryAsset = {
  id: string
  kind?: AssetKind
  syncStatus?: FaceSyncStatus
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

export function faceAsset(face: Face): LibraryAsset {
  return {
    id: face.id,
    kind: AssetKind.Face,
    syncStatus: face.syncStatus,
    mediaType: MediaType.Image,
    fileName: null,
    displayName: face.name,
    thumbnailUrl: face.thumbnailUrl,
    createdAt: face.createdAt,
  }
}

export function assetKey(asset: LibraryAsset) {
  return `${asset.kind ?? AssetKind.Media}:${asset.id}`
}
