import { createBrowserRouter, Link, Outlet, RouterProvider, useLocation } from 'react-router-dom'
import { MovementsLayout } from './features/movements/MovementsLayout'
import { MovementPanel } from './features/movements/MovementPanel'
import { VideoAnnotatorRoute } from './features/videos/VideoAnnotatorRoute'
import { VideoComparisonRoute } from './features/videos/VideoComparisonRoute'
import { AnnotationsPage } from './features/annotations/AnnotationsPage'
import styles from './app.module.css'

function RootLayout() {
  const location = useLocation()
  const onAnnotations = location.pathname.startsWith('/annotations')

  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <Link to="/" className={styles.logo}>Break Trainer</Link>
        <nav className={styles.nav}>
          <Link to="/" className={`${styles.navLink} ${!onAnnotations ? styles.navLinkActive : ''}`}>
            Movements
          </Link>
          <Link to="/annotations" className={`${styles.navLink} ${onAnnotations ? styles.navLinkActive : ''}`}>
            Annotations
          </Link>
        </nav>
      </header>
      <Outlet />
    </div>
  )
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        element: <MovementsLayout />,
        children: [
          {
            index: true,
            element: (
              <div className={styles.emptyPanel}>
                <p>Select a movement</p>
              </div>
            ),
          },
          { path: 'movements/:movementId', element: <MovementPanel /> },
          { path: 'movements/:movementId/videos/:videoId', element: <VideoAnnotatorRoute /> },
          { path: 'movements/:movementId/compare', element: <VideoComparisonRoute /> },
        ],
      },
      { path: 'annotations', element: <AnnotationsPage /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
