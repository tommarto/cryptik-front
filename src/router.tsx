import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { HomeScreen } from './screens/home/HomeScreen'
import { NotFoundScreen } from './screens/NotFoundScreen'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomeScreen /> },
      { path: '*', element: <NotFoundScreen /> },
    ],
  },
])
