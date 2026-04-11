import { useRef, useState, useEffect, useCallback } from 'react'
import { VideoComparisonPlayer } from './VideoComparisonPlayer'
import type { Video } from '../../db/db'
import styles from './VideoComparison.module.css'

interface Props {
  videos: Video[]
  onBack: () => void
}

export function VideoComparison({ videos, onBack }: Props) {
  const [leftId, setLeftId] = useState<number>(videos[0]?.id ?? 0)
  const [rightId, setRightId] = useState<number>(videos[1]?.id ?? 0)
  const [synced, setSynced] = useState(false)

  const leftRef = useRef<HTMLVideoElement>(null)
  const rightRef = useRef<HTMLVideoElement>(null)
  const isSyncing = useRef(false)

  const leftVideo = videos.find((v) => v.id === leftId)
  const rightVideo = videos.find((v) => v.id === rightId)

  const syncFrom = useCallback((source: HTMLVideoElement, target: HTMLVideoElement) => {
    if (isSyncing.current) return
    isSyncing.current = true
    target.currentTime = source.currentTime
    isSyncing.current = false
  }, [])

  useEffect(() => {
    if (!synced) return

    const left = leftRef.current
    const right = rightRef.current
    if (!left || !right) return

    const l = left
    const r = right
    function onLeftPlay() { r.play().catch(() => {}) }
    function onLeftPause() { r.pause() }
    function onLeftSeeked() { syncFrom(l, r) }
    function onRightPlay() { l.play().catch(() => {}) }
    function onRightPause() { l.pause() }
    function onRightSeeked() { syncFrom(r, l) }

    l.addEventListener('play', onLeftPlay)
    l.addEventListener('pause', onLeftPause)
    l.addEventListener('seeked', onLeftSeeked)
    r.addEventListener('play', onRightPlay)
    r.addEventListener('pause', onRightPause)
    r.addEventListener('seeked', onRightSeeked)

    return () => {
      l.removeEventListener('play', onLeftPlay)
      l.removeEventListener('pause', onLeftPause)
      l.removeEventListener('seeked', onLeftSeeked)
      r.removeEventListener('play', onRightPlay)
      r.removeEventListener('pause', onRightPause)
      r.removeEventListener('seeked', onRightSeeked)
    }
  }, [synced, leftId, rightId, syncFrom])

  return (
    <div className={styles.comparison}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onBack}>← Back</button>
        <div className={styles.selectors}>
          <select
            className={styles.select}
            value={leftId}
            onChange={(e) => setLeftId(Number(e.target.value))}
          >
            {videos.map((v) => (
              <option key={v.id} value={v.id}>{v.fileHandle?.name ?? v.fileName ?? 'Unknown file'}</option>
            ))}
          </select>
          <span className={styles.vs}>vs</span>
          <select
            className={styles.select}
            value={rightId}
            onChange={(e) => setRightId(Number(e.target.value))}
          >
            {videos.map((v) => (
              <option key={v.id} value={v.id}>{v.fileHandle?.name ?? v.fileName ?? 'Unknown file'}</option>
            ))}
          </select>
        </div>
        <button
          className={`${styles.syncBtn} ${synced ? styles.syncActive : ''}`}
          onClick={() => setSynced((s) => !s)}
        >
          {synced ? 'Synced' : 'Sync'}
        </button>
      </div>

      <div className={styles.players}>
        {leftVideo && (
          <VideoComparisonPlayer ref={leftRef} handle={leftVideo.fileHandle} fileName={leftVideo.fileName} />
        )}
        <div className={styles.divider} />
        {rightVideo && (
          <VideoComparisonPlayer ref={rightRef} handle={rightVideo.fileHandle} fileName={rightVideo.fileName} />
        )}
      </div>
    </div>
  )
}
