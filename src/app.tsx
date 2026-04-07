import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { MovementsLayout } from './features/movements/MovementsLayout'
import { MovementPanel } from './features/movements/MovementPanel'
import { VideoAnnotatorRoute } from './features/videos/VideoAnnotatorRoute'
import { VideoComparisonRoute } from './features/videos/VideoComparisonRoute'
import styles from './app.module.css'

const router = createBrowserRouter([
  {
    path: '/',
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
])

export default function App() {
  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <span className={styles.logo}>Break Trainer</span>
      </header>
      <RouterProvider router={router} />
    </div>
  )
}
