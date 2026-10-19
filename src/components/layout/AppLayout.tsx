import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Clapperboard, LayoutGrid, Menu, Sparkles } from 'lucide-react'
import brandLogo from '../../assets/brand-logo.jpg'
import { Brand } from '../composites/Brand'
import { AppRoutes } from '../../config/routes'
import { BrandOrientation } from '../../constants/ui'
import { GradientBackdrop } from './GradientBackdrop'
import { MobileMenu } from './MobileMenu'
import { Sidebar, type SidebarItem } from './Sidebar'
import { UserMenu } from './UserMenu'

const STORAGE_KEY = 'sidebar:collapsed'

const ITEMS: SidebarItem[] = [
  { label: 'Galería', to: AppRoutes.Gallery, icon: LayoutGrid },
  { label: 'Lipsync', to: AppRoutes.InfiniteTalk, icon: Sparkles },
  { label: 'Seedance', to: AppRoutes.Seedance, icon: Clapperboard },
]

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true'
    } catch {
      return false
    }
  })

  const [drawerOpen, setDrawerOpen] = useState(false)

  function toggle() {
    setCollapsed((previous) => {
      const next = !previous
      try {
        localStorage.setItem(STORAGE_KEY, String(next))
      } catch {
        /* empty */
      }
      return next
    })
  }

  function renderSidebar() {
    return (
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
    )
  }

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-200">
      <GradientBackdrop />

      <div className="relative z-10 flex items-center gap-3 border-b border-slate-800 px-4 py-3 md:hidden">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Abrir menú"
          className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200"
        >
          <Menu className="size-5" />
        </button>
        <img
          src={brandLogo}
          alt="Cryptik"
          className="size-9 rounded-lg brightness-105 contrast-[1.4] mix-blend-screen"
        />
        <span className="text-base font-semibold text-slate-100">Cryptik</span>
      </div>

      <div className="relative z-10 flex">
        <div className="hidden md:block">{renderSidebar()}</div>

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>

      {drawerOpen && (
        <MobileMenu
          items={ITEMS}
          logo={brandLogo}
          onClose={() => setDrawerOpen(false)}
        />
      )}
    </div>
  )
}
