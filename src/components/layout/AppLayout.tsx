import { Outlet } from 'react-router-dom'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <Outlet />
    </div>
  )
}
