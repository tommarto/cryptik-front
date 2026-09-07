import { useEffect } from 'react'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import {
  galleryService,
  type GalleryFilters,
  type Thumbnail,
} from '../services/galleryService'
import { workflowService } from '../services/workflowService'

export const PAGE_SIZE = 50

/**
 * Pagina con offset sobre `requested_at desc`. Los filtros forman parte de la
 * key, así que cambiarlos descarta las páginas cargadas y empieza de cero.
 */
export function useGallery(filters: GalleryFilters) {
  const queryClient = useQueryClient()
  const key = ['gallery', filters] as const

  const query = useInfiniteQuery({
    queryKey: key,
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      galleryService.page(filters, PAGE_SIZE, pageParam),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.executions.length < PAGE_SIZE
        ? undefined
        : allPages.reduce((total, page) => total + page.executions.length, 0),
  })

  // Realtime solo notifica las ejecuciones propias —la suscripción respeta
  // RLS—, así que la galería se refresca al generar uno mismo, no cuando genera
  // otro. Para eso haría falta recargar o una suscripción con más permisos.
  useEffect(() => {
    return workflowService.onExecutionChange(() => {
      void queryClient.invalidateQueries({ queryKey: ['gallery'] })
    })
  }, [queryClient])

  const pages = query.data?.pages ?? []

  return {
    ...query,
    executions: pages.flatMap((page) => page.executions),
    thumbnails: Object.assign(
      {},
      ...pages.map((page) => page.thumbnails),
    ) as Record<string, Thumbnail>,
    users: pages[0]?.users ?? [],
  }
}
