import { useEffect, useState } from 'react'
import { getVideoURL, ensurePermission } from '../../lib/fileSystem'
import styles from './videoPlayer.module.css'

interface Props {
  handle: FileSystemFileHandle
  createdAt: number
  onDelete: () => void
}

export function VideoPlayer({ handle, createdAt, onDelete }: Props) {
  const [url, setUrl] = useState<string>()
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    async function load() {
      await ensurePermission(handle)
      const u = await getVideoURL(handle)
      setUrl(u)
    }
    load()
  }, [handle])

  const date = new Date(createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className={styles.card}>
      <div className={styles.meta}>
        <span className={styles.filename}>{handle.name}</span>
        <div className={styles.group}>
        <span className={styles.date}>{date}</span>
        {confirming ? (
          <div className={styles.confirmDelete}>
            <span className={styles.confirmLabel}>Remove?</span>
            <button className={styles.confirmYes} onClick={onDelete}>Yes</button>
            <button className={styles.confirmNo} onClick={() => setConfirming(false)}>Cancel</button>
          </div>
        ) : (
          <button className={styles.deleteBtn} onClick={() => setConfirming(true)}>×</button>
        )}</div>
      </div>
      {url ? (
        <video className={styles.video} src={url} controls />
      ) : (
        <div className={styles.loading}>Loading…</div>
      )}
    </div>
  )
}
