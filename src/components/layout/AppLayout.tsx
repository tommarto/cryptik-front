import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import brandLogo from '../../assets/brand-logo.jpg'
import { Brand } from '../composites/Brand'
import { AppRoutes } from '../../config/routes'
import { BrandOrientation } from '../../constants/ui'
import { GradientBackdrop } from './GradientBackdrop'
import { Sidebar, type SidebarItem } from './Sidebar'
import { UserMenu } from './UserMenu'

const STORAGE_KEY = 'sidebar:collapsed'

const ITEMS: SidebarItem[] = [
  { label: 'Lipsync', to: AppRoutes.InfiniteTalk, icon: Sparkles },
]

export function AppLayout() {
  // Se recuerda entre recargas: es una preferencia, no estado de la sesión.
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true'
    } catch {
      return false
    }
  })

  function toggle() {
    setCollapsed((previous) => {
      const next = !previous
      try {
        localStorage.setItem(STORAGE_KEY, String(next))
      } catch {
        // modo privado o storage bloqueado: la preferencia no se recuerda
      }
      return next
    })
  }

  return (
    <div className="relative flex min-h-screen bg-slate-950 text-slate-200">
      <GradientBackdrop />

      <div className="relative z-10">
        <Sidebar
          collapsed={collapsed}
          onToggle={toggle}
          items={ITEMS}
          brand={
            <Brand
              name="Cryptik"
              tagline="Creative Engine"
              imageSrc={brandLogo}
              orientation={BrandOrientation.Horizontal}
            />
          }
          brandCollapsed={
            <img
              src={brandLogo}
              alt="Cryptik"
              className="size-9 rounded-lg brightness-105 contrast-[1.4] mix-blend-screen"
            />
          }
          footer={<UserMenu collapsed={collapsed} />}
        />
      </div>

      <main className="relative z-10 min-w-0 flex-1">
        <Outlet />
      </main>
    </div>
  )
}
