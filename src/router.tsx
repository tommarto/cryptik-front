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
import { NotFoundScreen } from './screens/NotFoundScreen'

export const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Sin sesión: fondo con degradado, sin navegación. */}
      <Route element={<AuthLayout />}>
        <Route path={AppRoutes.Login} element={<LoginScreen />} />
      </Route>

      {/* Con sesión. */}
      <Route element={<RequireAuth />}>
        <Route path={AppRoutes.Home} element={<AppLayout />}>
          <Route
            index
            element={<Navigate to={AppRoutes.InfiniteTalk} replace />}
          />
          <Route path="lipsync/infinitetalk" element={<InfiniteTalkScreen />} />
          <Route path="gallery" element={<GalleryScreen />} />
          <Route path="*" element={<NotFoundScreen />} />
        </Route>
      </Route>
    </>,
  ),
)
