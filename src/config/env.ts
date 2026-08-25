function required(key: keyof ImportMetaEnv): string {
  const value = import.meta.env[key]
  if (!value) throw new Error(`Falta la variable de entorno ${key}`)
  return value
}

export const env = {
  supabaseUrl: required('VITE_SUPABASE_URL'),
  supabaseAnonKey: required('VITE_SUPABASE_ANON_KEY'),
} as const
