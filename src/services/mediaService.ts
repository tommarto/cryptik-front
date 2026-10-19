import { supabase } from '../clients/supabaseClient'
import { readFunctionError } from '../utils/functionError'
import { makeThumbnail } from '../utils/image'
import { makeVideoThumbnail } from '../utils/video'
import type { LibraryAsset } from '../types/media'

export enum MediaStatus {
  Pending = 'pending',
  Uploaded = 'uploaded',
}

export type Media = {
  id: string
  key: string
  status: MediaStatus
}

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

async function put(url: string, body: Blob, contentType: string, label: string) {
  const response = await fetch(url, {
    method: 'PUT',
    body,
    headers: { 'Content-Type': contentType },
  })

  if (!response.ok) {
    throw new Error(`No se pudo subir "${label}" (${response.status}).`)
  }
}

type LibraryRow = {
  id: string
  media_type: LibraryAsset['mediaType']
  file_name: string | null
  display_name: string | null
  thumbnail_url: string | null
  created_at: string
}

export const mediaService = {
  listLibrary: async (
    workflowTypeCode: string,
    mediaTypes?: string[],
  ): Promise<LibraryAsset[]> => {
    const { data, error } = await supabase.functions.invoke('get-media-library', {
      body: {
        workflowTypeCode,
        mediaTypes: mediaTypes?.length ? mediaTypes : undefined,
      },
    })

    if (error) throw new Error(await readFunctionError(error))

    return (data.assets as LibraryRow[]).map((row) => ({
      id: row.id,
      mediaType: row.media_type,
      fileName: row.file_name,
      displayName: row.display_name,
      thumbnailUrl: row.thumbnail_url,
      createdAt: row.created_at,
    }))
  },

  byIds: async (ids: string[]): Promise<LibraryAsset[]> => {
    if (ids.length === 0) return []

    const { data, error } = await supabase.functions.invoke('get-media-library', {
      body: { ids },
    })
    if (error) throw new Error(await readFunctionError(error))

    const porId = new Map(
      (data.assets as LibraryRow[]).map((row) => [row.id, row]),
    )

    return ids
      .map((id) => porId.get(id))
      .filter((row): row is LibraryRow => Boolean(row))
      .map((row) => ({
        id: row.id,
        mediaType: row.media_type,
        fileName: row.file_name,
        displayName: row.display_name,
        thumbnailUrl: row.thumbnail_url,
        createdAt: row.created_at,
      }))
  },

  setName: async (mediaId: string, displayName: string): Promise<void> => {
    const { error } = await supabase.functions.invoke('set-media-name', {
      body: { mediaId, displayName },
    })

    if (error) throw new Error(await readFunctionError(error))
  },

  upload: async (file: File, workflowTypeCode: string): Promise<Media> => {
    const contentType = normalizeContentType(file.type)

    const thumbnail = contentType.startsWith('image/')
      ? await makeThumbnail(file)
      : contentType.startsWith('video/')
        ? await makeVideoThumbnail(file)
        : null

    const { data: created, error: createError } = await supabase.functions.invoke(
      'create-media-upload',
      {
        body: {
          contentType,
          workflowTypeCode,
          fileName: file.name,
          width: thumbnail?.width,
          height: thumbnail?.height,
        },
      },
    )
    if (createError) throw new Error(await readFunctionError(createError))

    const uploads = [put(created.uploadUrl, file, file.type, file.name)]

    if (created.thumbnailUploadUrl && thumbnail) {
      uploads.push(
        put(
          created.thumbnailUploadUrl,
          thumbnail.blob,
          'image/jpeg',
          `${file.name} (miniatura)`,
        ),
      )
    }

    await Promise.all(uploads)

    const { data: verified, error: verifyError } = await supabase.functions.invoke(
      'verify-media',
      { body: { mediaId: created.media.id } },
    )
    if (verifyError) throw new Error(await readFunctionError(verifyError))

    return verified.media as Media
  },
}
