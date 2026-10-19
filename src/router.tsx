import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
} from 'react-router-dom'
import { AppRoutes } from './config/routes'
import { AppLayout } from './components/layout/AppLayout'
import { AuthLayout } from './components/layout/AuthLayout'
import { RequireAuth } from './components/layout/RequireAuth'
import { GalleryScreen } from './screens/gallery/GalleryScreen'
import { InfiniteTalkScreen } from './screens/lipsync/InfiniteTalkScreen'
import { LoginScreen } from './screens/auth/LoginScreen'
import { SeedanceScreen } from './screens/seedance/SeedanceScreen'
import { NotFoundScreen } from './screens/NotFoundScreen'

export const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route element={<AuthLayout />}>
        <Route path={AppRoutes.Login} element={<LoginScreen />} />
      </Route>

      <Route element={<RequireAuth />}>
        <Route path={AppRoutes.Home} element={<AppLayout />}>
          <Route index element={<Navigate to={AppRoutes.Gallery} replace />} />
          <Route path="lipsync/infinitetalk" element={<InfiniteTalkScreen />} />
          <Route path="video/seedance" element={<SeedanceScreen />} />
          <Route path="gallery" element={<GalleryScreen />} />
          <Route path="*" element={<NotFoundScreen />} />
        </Route>
      </Route>
    </>,
  ),
)
