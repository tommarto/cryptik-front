import type { Session } from '@supabase/supabase-js'
import { supabase } from '../clients/supabaseClient'

/** Dominio de Workspace. Solo mejora la UX del selector de cuentas de Google. */
const WORKSPACE_DOMAIN = 'anymal.media'

export const authService = {
  /**
   * Redirige a Google. `hd` no restringe nada — Google lo trata como un hint
   * para preseleccionar la cuenta del dominio. Quien restringe de verdad es la
   * pantalla de consentimiento configurada como Internal.
   */
  signInWithGoogle: async (): Promise<void> => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: { hd: WORKSPACE_DOMAIN },
      },
    })

    if (error) throw error
  },

  signOut: async (): Promise<void> => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  getSession: async (): Promise<Session | null> => {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    return data.session
  },

  onAuthStateChange: (listener: (session: Session | null) => void) => {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      listener(session)
    })

    return () => data.subscription.unsubscribe()
  },
}
