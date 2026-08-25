import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import brandLogo from '../../assets/brand-logo.jpg'
import { Brand } from '../../components/composites/Brand'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { GoogleIcon } from '../../components/ui/GoogleIcon'
import { Separator } from '../../components/ui/Separator'
import { Spinner } from '../../components/ui/Spinner'
import { AppRoutes } from '../../config/routes'
import { AlertVariant, BrandOrientation, ButtonVariant } from '../../constants/ui'
import { useAuth } from '../../hooks/useAuth'
import { authService } from '../../services/authService'

export function LoginScreen() {
  const { session, loading } = useAuth()
  const [signingIn, setSigningIn] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner />
      </div>
    )
  }

  // Ya logueado: no tiene sentido mostrarle el login.
  if (session) return <Navigate to={AppRoutes.InfiniteTalk} replace />

  async function signIn() {
    setSigningIn(true)
    setError(null)

    try {
      // Si sale bien, el browser navega a Google y esta pantalla se desmonta.
      await authService.signInWithGoogle()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not start login.')
      setSigningIn(false)
    }
  }

  return (
    <Card>
      <div className="flex flex-col gap-6 py-2">
        <Brand
          name="Cryptik"
          tagline="Creative Engine"
          imageSrc={brandLogo}
          orientation={BrandOrientation.Vertical}
        />

        <Separator />

        <p className="text-center text-xs text-slate-400">
          Login to access your workspace.
        </p>

        {error && (
          <Alert
            variant={AlertVariant.Error}
            title="Login failed"
            onDismiss={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        <Button
          variant={ButtonVariant.Secondary}
          className="w-full"
          icon={<GoogleIcon />}
          onClick={signIn}
          disabled={signingIn}
        >
          {signingIn ? 'Redirecting…' : 'Login with your company account'}
        </Button>
      </div>
    </Card>
  )
}
