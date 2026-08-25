import { createClient } from '@supabase/supabase-js'
import { env } from '../config/env'

/**
 * La anon key es pública por diseño: viaja en el bundle. Lo que protege los
 * datos son las políticas de RLS, no esconder esta llave.
 */
export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey)
