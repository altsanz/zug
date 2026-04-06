import { useState } from 'react'
import { useVideoUrl } from '../../hooks/useVideoUrl'
import styles from './videoPlayer.module.css'

interface Props {
  handle: FileSystemFileHandle
  createdAt: number
  onDelete: () => void
  onClick?: () => void
}

export function VideoPlayer({ handle, createdAt, onDelete, onClick }: Props) {
  const { url } = useVideoUrl(handle)
  const [confirming, setConfirming] = useState(false)

  const date = new Date(createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className={styles.card}>
      <div
        className={`${styles.meta} ${onClick ? styles.metaClickable : ''}`}
        onClick={confirming ? undefined : onClick}
      >
        <span className={styles.filename}>{handle.name}</span>
        <div className={styles.group}>
          <span className={styles.date}>{date}</span>
          {confirming ? (
            <div className={styles.confirmDelete} onClick={(e) => e.stopPropagation()}>
              <span className={styles.confirmLabel}>Remove?</span>
              <button className={styles.confirmYes} onClick={onDelete}>Yes</button>
              <button className={styles.confirmNo} onClick={() => setConfirming(false)}>Cancel</button>
            </div>
          ) : (
            <button
              className={styles.deleteBtn}
              onClick={(e) => { e.stopPropagation(); setConfirming(true) }}
            >×</button>
          )}
        </div>
      </div>
      {url ? (
        <video className={styles.video} src={url} controls />
      ) : (
        <div className={styles.loading}>Loading…</div>
      )}
    </div>
  )
}
