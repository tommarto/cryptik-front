import { Outlet } from 'react-router-dom'
import { GradientBackdrop } from './GradientBackdrop'

export function AppLayout() {
  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-200">
      <GradientBackdrop />

      <div className="relative">
        <Outlet />
      </div>
    </div>
  )
}
