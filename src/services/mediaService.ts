import { supabase } from '../clients/supabaseClient'
import { readFunctionError } from '../utils/functionError'

export enum MediaStatus {
  Pending = 'pending',
  Uploaded = 'uploaded',
}

export type Media = {
  id: string
  key: string
  status: MediaStatus
}

/**
 * Los browsers reportan variantes para el mismo formato. El worker solo conoce
 * las formas canónicas, así que hay que normalizar antes de mandar.
 */
const CONTENT_TYPE_ALIASES: Record<string, string> = {
  'audio/x-m4a': 'audio/mp4',
  'audio/m4a': 'audio/mp4',
  'audio/x-wav': 'audio/wav',
  'audio/wave': 'audio/wav',
  'audio/mp3': 'audio/mpeg',
  'image/jpg': 'image/jpeg',
}

export function normalizeContentType(type: string): string {
  return CONTENT_TYPE_ALIASES[type] ?? type
}

export const mediaService = {
  /**
   * Sube un archivo en tres pasos: pedir la firma, subir a S3, y confirmar.
   * El `verify` no es una formalidad — es el servidor mirando el objeto real,
   * porque una subida cortada a la mitad deja un archivo que existe pero no
   * sirve, y sin esa comprobación el worker fallaría recién quince minutos
   * después.
   */
  upload: async (file: File): Promise<Media> => {
    const { data: created, error: createError } = await supabase.functions.invoke(
      'create-media-upload',
      { body: { contentType: normalizeContentType(file.type) } },
    )
    if (createError) throw new Error(await readFunctionError(createError))

    const response = await fetch(created.uploadUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type },
    })
    if (!response.ok) {
      throw new Error(`No se pudo subir "${file.name}" (${response.status}).`)
    }

    const { data: verified, error: verifyError } = await supabase.functions.invoke(
      'verify-media',
      { body: { mediaId: created.media.id } },
    )
    if (verifyError) throw new Error(await readFunctionError(verifyError))

    return verified.media as Media
  },
}
