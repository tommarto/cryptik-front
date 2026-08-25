import { use } from 'react'
import { AuthContext, type AuthState } from '../context/authContext'

export function useAuth(): AuthState {
  const context = use(AuthContext)
  if (!context) throw new Error('useAuth necesita estar dentro de <AuthProvider>')
  return context
}
