import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { LogOut } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { authService } from '../../services/authService'

/**
 * Bloque de usuario y salida. Al cerrar sesión limpia el cache de queries: si no,
 * los trabajos del usuario anterior quedan en memoria y el siguiente que entre en
 * esa máquina los ve por un instante antes de que lleguen los suyos.
 */
export function UserMenu({ collapsed }: { collapsed: boolean }) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [signingOut, setSigningOut] = useState(false)

  const name = (user?.user_metadata?.full_name as string) ?? user?.email ?? ''
  const avatar = user?.user_metadata?.avatar_url as string | undefined

  async function signOut() {
    setSigningOut(true)
    try {
      await authService.signOut()
      queryClient.clear()
    } finally {
      setSigningOut(false)
    }
  }

  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-2">
        <Avatar src={avatar} name={name} title={user?.email ?? ''} />
        <button
          type="button"
          onClick={signOut}
          disabled={signingOut}
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
          className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-200 disabled:opacity-50"
        >
          <LogOut className="size-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Avatar src={avatar} name={name} title={user?.email ?? ''} />

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-slate-200">{name}</p>
        <p className="truncate text-[11px] text-slate-500">{user?.email}</p>
      </div>

      <button
        type="button"
        onClick={signOut}
        disabled={signingOut}
        aria-label="Cerrar sesión"
        title="Cerrar sesión"
        className="shrink-0 rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-200 disabled:opacity-50"
      >
        <LogOut className="size-4" />
      </button>
    </div>
  )
}

function Avatar({
  src,
  name,
  title,
}: {
  src?: string
  name: string
  title: string
}) {
  if (src) {
    return (
      <img
        src={src}
        alt=""
        title={title}
        className="size-8 shrink-0 rounded-full"
      />
    )
  }

  return (
    <div
      title={title}
      className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-medium text-slate-300"
    >
      {name.charAt(0).toUpperCase() || '?'}
    </div>
  )
}
