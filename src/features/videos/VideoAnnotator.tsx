import { useEffect, useRef, useState } from 'react'
import { useVideoUrl } from '../../hooks/useVideoUrl'
import { annotationsApi } from '../annotations/annotations.api'
import { AnnotationTimeline } from '../annotations/AnnotationTimeline'
import { AnnotationPanel } from '../annotations/AnnotationPanel'
import type { Annotation, Video } from '../../db/db'
import styles from './VideoAnnotator.module.css'

function tsToDateInput(ts: number): string {
  const d = new Date(ts)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function dateInputToTs(val: string): number {
  const [y, mo, d] = val.split('-').map(Number)
  return new Date(y, mo - 1, d).getTime()
}

interface Props {
  video: Video
  onBack: () => void
  onDelete: () => void
  onCompare: () => void
  onDateChange: (ts: number) => void
  initialTime?: number
}

export function VideoAnnotator({ video, onBack, onDelete, onCompare, onDateChange, initialTime }: Props) {
  const { url } = useVideoUrl(video.fileHandle)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [confirming, setConfirming] = useState(false)
  const [editingDate, setEditingDate] = useState(false)

  async function loadAnnotations() {
    const list = await annotationsApi.getByVideo(video.id!)
    setAnnotations(list)
  }

  useEffect(() => {
    loadAnnotations()
  }, [video.id])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      const video = videoRef.current
      if (!video) return
      const FRAME = 1 / 30
      if (e.key === '.') { e.preventDefault(); video.currentTime += FRAME }
      if (e.key === ',') { e.preventDefault(); video.currentTime -= FRAME }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  function handleSeek(t: number) {
    if (videoRef.current) {
      videoRef.current.currentTime = t
    }
  }

  const formattedDate = new Date(video.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className={styles.annotator}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onBack}>← Back</button>
        <span className={styles.filename}>{video.fileHandle?.name ?? video.fileName ?? 'Unknown file'}</span>
        {editingDate ? (
          <input
            type="date"
            className={styles.dateInput}
            defaultValue={tsToDateInput(video.createdAt)}
            autoFocus
            onKeyDown={(e) => { if (e.key === 'Escape') setEditingDate(false) }}
            onBlur={(e) => {
              if(e.target.value) onDateChange(dateInputToTs(e.target.value))
              return setEditingDate(false)
            }}
          />
        ) : (
          <span
            className={styles.date}
            onClick={() => setEditingDate(true)}
            title="Click to edit date"
          >
            {formattedDate}
          </span>
        )}
        {confirming ? (
          <div className={styles.confirmDelete}>
            <span className={styles.confirmLabel}>Delete?</span>
            <button className={styles.confirmYes} onClick={onDelete}>Yes</button>
            <button className={styles.confirmNo} onClick={() => setConfirming(false)}>Cancel</button>
          </div>
        ) : (
          <>
            <button className={styles.compareBtn} onClick={onCompare}>Compare</button>
            <button className={styles.deleteBtn} onClick={() => setConfirming(true)}>Delete</button>
          </>
        )}
      </div>

      {!video.fileHandle ? (
        <div className={styles.loading}>File not linked — re-add this video to restore playback</div>
      ) : url ? (
        <video
          ref={videoRef}
          className={styles.video}
          src={url}
          controls
          onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime ?? 0)}
          onLoadedMetadata={() => {
              setDuration(videoRef.current?.duration ?? 0)
              if (initialTime !== undefined && videoRef.current) {
                videoRef.current.currentTime = initialTime
              }
            }}
        />
      ) : (
        <div className={styles.loading}>Loading…</div>
      )}

      <AnnotationTimeline
        annotations={annotations}
        duration={duration}
        onSeek={handleSeek}
      />

      <AnnotationPanel
        annotations={annotations}
        currentTime={currentTime}
        videoId={video.id!}
        onSeek={handleSeek}
        onMutate={loadAnnotations}
      />
    </div>
  )
}
