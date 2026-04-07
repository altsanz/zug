import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from '../../hooks/useLiveQuery'
import { db } from '../../db/db'
import type { Annotation, Movement, Video } from '../../db/db'
import styles from './AnnotationsPage.module.css'

type AnnotationType = 'note' | 'issue' | 'improvement' | 'idea'

const TYPE_COLOR: Record<AnnotationType, { color: string; bg: string }> = {
  note:        { color: 'var(--accent)',  bg: 'rgba(212, 255, 90,  0.12)' },
  issue:       { color: '#ff5f5f',        bg: 'rgba(255, 95,  95,  0.12)' },
  improvement: { color: '#4dffb4',        bg: 'rgba(77,  255, 180, 0.12)' },
  idea:        { color: '#c084fc',        bg: 'rgba(192, 132, 252, 0.12)' },
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function AnnotationsPage() {
  const navigate = useNavigate()

  const { data: annotations = [] } = useLiveQuery(() => db.annotations.toArray())
  const { data: videos = [] }      = useLiveQuery(() => db.videos.toArray())
  const { data: movements = [] }   = useLiveQuery(() => db.movements.toArray())

  const [movementFilter, setMovementFilter] = useState<number | null>(null)
  const [typeFilter, setTypeFilter]         = useState<AnnotationType | null>(null)
  const [textFilter, setTextFilter]         = useState('')

  const videoMap = new Map<number, Video>(videos.map((v) => [v.id!, v]))
  const movementMap = new Map<number, Movement>(movements.map((m) => [m.id!, m]))

  type Row = { annotation: Annotation; video: Video; movement: Movement }

  const rows: Row[] = annotations
    .flatMap((a) => {
      const video = videoMap.get(a.videoId)
      if (!video) return []
      const movement = movementMap.get(video.movementId)
      if (!movement) return []
      return [{ annotation: a, video, movement }]
    })
    .sort((a, b) => {
      const mc = a.movement.name.localeCompare(b.movement.name)
      if (mc !== 0) return mc
      const vc = a.video.fileHandle.name.localeCompare(b.video.fileHandle.name)
      if (vc !== 0) return vc
      return a.annotation.timestamp - b.annotation.timestamp
    })

  const filtered = rows.filter(({ annotation, movement }) => {
    if (movementFilter !== null && movement.id !== movementFilter) return false
    if (typeFilter !== null && annotation.type !== typeFilter) return false
    if (textFilter && !annotation.text.toLowerCase().includes(textFilter.toLowerCase())) return false
    return true
  })

  function openAnnotation(row: Row) {
    const { annotation, video, movement } = row
    navigate(
      `/movements/${movement.id}/videos/${video.id}?t=${annotation.timestamp}`
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <input
          className={styles.search}
          placeholder="Search annotations…"
          value={textFilter}
          onChange={(e) => setTextFilter(e.target.value)}
        />
        <select
          className={styles.filter}
          value={movementFilter ?? ''}
          onChange={(e) => setMovementFilter(e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">All movements</option>
          {movements.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
        <select
          className={styles.filter}
          value={typeFilter ?? ''}
          onChange={(e) => setTypeFilter((e.target.value as AnnotationType) || null)}
        >
          <option value="">All types</option>
          <option value="note">Note</option>
          <option value="issue">Issue</option>
          <option value="improvement">Improvement</option>
          <option value="idea">Idea</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className={styles.empty}>
          {annotations.length === 0 ? 'No annotations yet' : 'No annotations match the filters'}
        </div>
      ) : (
        <ul className={styles.list}>
          {filtered.map(({ annotation, video, movement }) => (
            <li
              key={annotation.id}
              className={styles.row}
              onClick={() => openAnnotation({ annotation, video, movement })}
            >
              <div className={styles.context}>
                <span className={styles.movementName}>{movement.name}</span>
                <span className={styles.separator}>›</span>
                <span className={styles.videoName}>{video.fileHandle.name}</span>
              </div>
              <button
                className={styles.timestamp}
                onClick={(e) => { e.stopPropagation(); openAnnotation({ annotation, video, movement }) }}
              >
                {formatTime(annotation.timestamp)}
              </button>
              <span className={styles.text}>{annotation.text}</span>
              <span
                className={styles.badge}
                style={{
                  color: TYPE_COLOR[annotation.type as AnnotationType]?.color,
                  background: TYPE_COLOR[annotation.type as AnnotationType]?.bg,
                }}
              >
                {annotation.type}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
