import { useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from '../../hooks/useLiveQuery'
import { videosApi } from '../videos/videos.api'
import { VideoPlayer } from '../videos/videoPlayer'
import { ChecklistPanel } from '../checklists/ChecklistPanel'
import { db } from '../../db/db'
import styles from './MovementPanel.module.css'

export function MovementPanel() {
  const { movementId } = useParams()
  const navigate = useNavigate()
  const mid = Number(movementId)

  const { data: movement } = useLiveQuery(() => db.movements.get(mid), [mid])
  const { data: videos = [] } = useLiveQuery(() => videosApi.getByMovement(mid), [mid])

  return (
    <>
      <div className={styles.panelHeader}>
        <span className={styles.panelTitle}>{movement?.name}</span>
        <div className={styles.panelActions}>
          {videos.length >= 2 && (
            <button
              className={styles.compareBtn}
              onClick={() => navigate(`/movements/${movementId}/compare`)}
            >
              Compare
            </button>
          )}
          <button
            className={styles.addVideoBtn}
            onClick={() => videosApi.add(mid)}
          >
            + Add video
          </button>
        </div>
      </div>

      <div className={styles.panelContent}>
        {videos.length === 0 ? (
          <div className={styles.emptyPanel}>
            <p>No videos yet</p>
          </div>
        ) : (
          <div className={styles.videoList}>
            {videos.map((v) => (
              <VideoPlayer
                key={v.id}
                handle={v.fileHandle}
                createdAt={v.createdAt}
                onDelete={() => videosApi.remove(v.id!)}
                onDateChange={(ts) => videosApi.updateDate(v.id!, ts)}
                onClick={() => navigate(`/movements/${movementId}/videos/${v.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      <ChecklistPanel movementId={mid} />
    </>
  )
}
