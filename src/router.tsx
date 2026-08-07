import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
} from 'react-router-dom'
import { AppRoutes } from './config/routes'
import { AppLayout } from './components/layout/AppLayout'
import { InfiniteTalkScreen } from './screens/lipsync/InfiniteTalkScreen'
import { NotFoundScreen } from './screens/NotFoundScreen'

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path={AppRoutes.Home} element={<AppLayout />}>
      <Route index element={<Navigate to={AppRoutes.InfiniteTalk} replace />} />
      <Route path="lipsync/infinitetalk" element={<InfiniteTalkScreen />} />
      <Route path="*" element={<NotFoundScreen />} />
    </Route>,
  ),
)
