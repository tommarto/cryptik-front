import { NavLink } from 'react-router-dom'
import { X } from 'lucide-react'
import type { SidebarItem } from './Sidebar'
import { UserMenu } from './UserMenu'

type MobileMenuProps = {
  items: SidebarItem[]
  logo: string
  onClose: () => void
}

/**
 * En mobile el menú es un panel a pantalla completa, no la barra del escritorio
 * encogida: con 240px sobre un fondo semitransparente parecía una barra rota.
 *
 * Tiene su propio componente porque los dos diseños ya divergieron — este no
 * colapsa, no tiene borde lateral y sus filas son de ancho completo.
 */
export function MobileMenu({ items, logo, onClose }: MobileMenuProps) {
  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-slate-950 md:hidden">
      {/* Mismo alto y espaciado que la barra superior, para que la cruz caiga
          exactamente donde estaba el botón de hamburguesa. */}
      <div className="flex items-center gap-3 border-b border-slate-800 px-4 py-3">
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar menú"
          className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200"
        >
          <X className="size-5" />
        </button>
        <img
          src={logo}
          alt="Cryptik"
          className="size-9 rounded-lg brightness-105 contrast-[1.4] mix-blend-screen"
        />
        <span className="text-base font-semibold text-slate-100">Cryptik</span>
      </div>

      <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-3">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-4 py-3 text-base transition-colors ${
                isActive
                  ? 'bg-indigo-600/15 text-indigo-300'
                  : 'text-slate-300 hover:bg-slate-800'
              }`
            }
          >
            <Icon className="size-5 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-800 p-4">
        <UserMenu collapsed={false} />
      </div>
    </div>
  )
}
