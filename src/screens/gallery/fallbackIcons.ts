import { FileAudio, Image as ImageIcon, Video } from 'lucide-react'
import { MediaType } from '../../types/workflow'

/**
 * Placeholder para cuando falta la miniatura, que no debería pasar. Vive en su
 * propio archivo porque exportar un objeto junto a un componente rompe Fast
 * Refresh.
 */
export const FALLBACK_ICON = {
  [MediaType.Audio]: FileAudio,
  [MediaType.Image]: ImageIcon,
  [MediaType.Video]: Video,
} as const
