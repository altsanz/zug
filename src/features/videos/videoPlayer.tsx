import { useState } from 'react'
import { useVideoUrl } from '../../hooks/useVideoUrl'
import styles from './videoPlayer.module.css'

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
  handle: FileSystemFileHandle
  createdAt: number
  onDelete: () => void
  onDateChange?: (ts: number) => void
  onClick?: () => void
  listMode?: boolean
}

export function VideoPlayer({ handle, createdAt, onDelete, onDateChange, onClick, listMode = false }: Props) {
  const { url } = useVideoUrl(handle, !listMode)
  const [confirming, setConfirming] = useState(false)
  const [editingDate, setEditingDate] = useState(false)

  const formattedDate = new Date(createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className={`${styles.card} ${listMode ? styles.cardList : ''}`}>
      <div
        className={`${styles.meta} ${onClick ? styles.metaClickable : ''}`}
        onClick={confirming || editingDate ? undefined : onClick}
      >
        <span className={styles.filename}>{handle.name}</span>
        <div className={styles.group}>
          {editingDate ? (
            <input
              type="date"
              className={styles.dateInput}
              defaultValue={tsToDateInput(createdAt)}
              autoFocus
              onClick={(e) => e.stopPropagation()}
              
              onBlur={(e) => {
                onDateChange?.(dateInputToTs(e.target.value))
                setEditingDate(false)
            }}
            />
          ) : (
            <span
              className={`${styles.date} ${onDateChange ? styles.dateEditable : ''}`}
              onClick={(e) => { e.stopPropagation(); if (onDateChange) setEditingDate(true) }}
            >
              {formattedDate}
            </span>
          )}
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
      {!listMode && (url ? (
        <video className={styles.video} src={url} controls />
      ) : (
        <div className={styles.loading}>Loading…</div>
      ))}
    </div>
  )
}
