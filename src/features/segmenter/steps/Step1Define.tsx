import { useEffect, useRef, useState } from 'react'
import { db } from '../../../db/db'
import type { Movement } from '../../../db/db'
import type { SegmentDraft } from '../segmenter.types'
import styles from './Step1Define.module.css'

function fmt(s: number): string {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  const ms = Math.round((s % 1) * 1000)
  return `${m}:${sec.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`
}

interface Props {
  segments: SegmentDraft[]
  onSegmentsChange: (s: SegmentDraft[]) => void
  videoUrl: string | null
  onPickFile: () => void
  onDropFile: (file: File) => void
  onNext: () => void
}

export function Step1Define({ segments, onSegmentsChange, videoUrl, onPickFile, onDropFile, onNext }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [markStart, setMarkStart] = useState<number | null>(null)
  const [markEnd, setMarkEnd] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [movementId, setMovementId] = useState<number | ''>('')
  const [movements, setMovements] = useState<Movement[]>([])
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    db.movements.toArray().then(setMovements)
  }, [])

  // Reset player position when video source changes
  useEffect(() => {
    setCurrentTime(0)
    setMarkStart(null)
    setMarkEnd(null)
  }, [videoUrl])

  function addSegment() {
    if (!name.trim() || movementId === '' || markStart === null || markEnd === null) return
    if (markEnd <= markStart) return
    onSegmentsChange([
      ...segments,
      {
        id: crypto.randomUUID(),
        name: name.trim(),
        movementId: Number(movementId),
        startTime: markStart,
        endTime: markEnd,
        annotations: [],
      },
    ])
    setName('')
    setMarkStart(null)
    setMarkEnd(null)
  }

  const canAdd =
    name.trim() !== '' &&
    movementId !== '' &&
    markStart !== null &&
    markEnd !== null &&
    markEnd > markStart

  return (
    <div className={styles.container}>
      <div
        className={`${styles.videoArea} ${!videoUrl && dragging ? styles.dragOver : ''}`}
        onDragOver={!videoUrl ? (e) => { e.preventDefault(); setDragging(true) } : undefined}
        onDragLeave={!videoUrl ? () => setDragging(false) : undefined}
        onDrop={!videoUrl ? (e) => {
          e.preventDefault()
          setDragging(false)
          const file = e.dataTransfer.files[0]
          if (file && file.type.startsWith('video/')) onDropFile(file)
        } : undefined}
      >
        {!videoUrl ? (
          <div className={styles.placeholder}>
            <button className={styles.pickBtn} onClick={onPickFile}>
              Select video file
            </button>
            {dragging && <span className={styles.dropHint}>Drop to load</span>}
          </div>
        ) : (
          <video
            ref={videoRef}
            className={styles.video}
            src={videoUrl}
            controls
            onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime ?? 0)}
          />
        )}
      </div>

      {videoUrl && (
        <>
          <div className={styles.controls}>
            <span className={styles.currentTime}>{fmt(currentTime)}</span>
            <button
              className={`${styles.markBtn} ${markStart !== null ? styles.marked : ''}`}
              onClick={() => setMarkStart(videoRef.current?.currentTime ?? 0)}
            >
              Set Start {markStart !== null && `(${fmt(markStart)})`}
            </button>
            <button
              className={`${styles.markBtn} ${markEnd !== null ? styles.marked : ''}`}
              onClick={() => setMarkEnd(videoRef.current?.currentTime ?? 0)}
            >
              Set End {markEnd !== null && `(${fmt(markEnd)})`}
            </button>
            <input
              className={styles.nameInput}
              placeholder="Segment name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') addSegment() }}
            />
            <select
              className={styles.movementSelect}
              value={movementId}
              onChange={(e) => setMovementId(e.target.value === '' ? '' : Number(e.target.value))}
            >
              <option value="">Movement…</option>
              {movements.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            <button className={styles.addBtn} onClick={addSegment} disabled={!canAdd}>
              Add
            </button>
          </div>

          <div className={styles.changeVideo}>
            <button className={styles.changeVideoBtn} onClick={onPickFile}>
              Change video
            </button>
          </div>
        </>
      )}

      {segments.length > 0 && (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Movement</th>
              <th>Start</th>
              <th>End</th>
              <th>Duration</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {segments.map((seg, i) => {
              const mov = movements.find((m) => m.id === seg.movementId)
              return (
                <tr key={seg.id}>
                  <td>{i + 1}</td>
                  <td>{seg.name}</td>
                  <td>{mov?.name ?? '?'}</td>
                  <td>{fmt(seg.startTime)}</td>
                  <td>{fmt(seg.endTime)}</td>
                  <td>{fmt(seg.endTime - seg.startTime)}</td>
                  <td>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => onSegmentsChange(segments.filter((s) => s.id !== seg.id))}
                    >
                      ×
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}

      <div className={styles.footer}>
        <button className={styles.nextBtn} disabled={segments.length === 0} onClick={onNext}>
          Next →
        </button>
      </div>
    </div>
  )
}
