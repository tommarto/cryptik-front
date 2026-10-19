import { FileAudio, Image, Video } from 'lucide-react'
import type { ComponentType } from 'react'
import { MediaType } from '../../types/workflow'

export const ASSET_ICON: Record<MediaType, ComponentType<{ className?: string }>> = {
  [MediaType.Image]: Image,
  [MediaType.Video]: Video,
  [MediaType.Audio]: FileAudio,
}
