import { createContext } from 'react'
import type { Session, User } from '@supabase/supabase-js'

export type AuthState = {
  session: Session | null
  user: User | null
  /** `true` hasta que se resuelve si había sesión guardada. */
  loading: boolean
}

/** Separado del provider: exportar un valor no-componente desde un archivo de
 *  componente rompe Fast Refresh. */
export const AuthContext = createContext<AuthState | undefined>(undefined)
