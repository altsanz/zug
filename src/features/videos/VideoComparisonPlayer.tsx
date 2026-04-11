import { forwardRef } from 'react'
import { useVideoUrl } from '../../hooks/useVideoUrl'
import styles from './VideoComparisonPlayer.module.css'

interface Props {
  handle?: FileSystemFileHandle
  fileName?: string
}

export const VideoComparisonPlayer = forwardRef<HTMLVideoElement, Props>(
  function VideoComparisonPlayer({ handle, fileName }, ref) {
    const { url } = useVideoUrl(handle)
    const displayName = handle?.name ?? fileName ?? 'Unknown file'

    return (
      <div className={styles.player}>
        <div className={styles.label}>{displayName}</div>
        {!handle ? (
          <div className={styles.loading}>File not linked</div>
        ) : url ? (
          <video ref={ref} className={styles.video} src={url} controls />
        ) : (
          <div className={styles.loading}>Loading…</div>
        )}
      </div>
    )
  }
)
