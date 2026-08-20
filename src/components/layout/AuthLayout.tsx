import { Outlet } from 'react-router-dom'
import { GradientBackdrop } from './GradientBackdrop'

/**
 * Marco de las pantallas sin sesión: fondo con el degradado y la card
 * centrada. No tiene navegación a propósito.
 */
export function AuthLayout() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 p-6">
      <GradientBackdrop />

      <div className="relative w-full max-w-xs">
        <Outlet />
      </div>
    </div>
  )
}
