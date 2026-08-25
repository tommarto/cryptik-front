import { Navigate, Outlet } from 'react-router-dom'
import { AppRoutes } from '../../config/routes'
import { useAuth } from '../../hooks/useAuth'
import { Spinner } from '../ui/Spinner'

/**
 * Ruta de layout: deja pasar solo con sesión. Mientras se resuelve si había una
 * guardada muestra el spinner, para no mandar al login a alguien que sí está
 * logueado.
 */
export function RequireAuth() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <Spinner />
      </div>
    )
  }

  if (!session) return <Navigate to={AppRoutes.Login} replace />

  return <Outlet />
}
