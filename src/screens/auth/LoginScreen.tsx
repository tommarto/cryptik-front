import brandLogo from '../../assets/brand-logo.jpg'
import { Brand } from '../../components/composites/Brand'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { GoogleIcon } from '../../components/ui/GoogleIcon'
import { Separator } from '../../components/ui/Separator'
import { BrandOrientation, ButtonVariant } from '../../constants/ui'

export function LoginScreen() {
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

        <Button
          variant={ButtonVariant.Secondary}
          className="w-full"
          icon={<GoogleIcon />}
        >
          Login with your company account
        </Button>
      </div>
    </Card>
  )
}
