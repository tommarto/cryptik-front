import { Outlet } from 'react-router-dom'

/**
 * Marco de las pantallas sin sesión: fondo con el degradado azul y la card
 * centrada. No tiene navegación a propósito.
 */
export function AuthLayout() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_25%_15%,rgba(37,99,235,0.28),transparent_55%),radial-gradient(ellipse_at_75%_85%,rgba(79,70,229,0.22),transparent_55%)]"
      />

      <div className="relative w-full max-w-xs">
        <Outlet />
      </div>
    </div>
  )
}
