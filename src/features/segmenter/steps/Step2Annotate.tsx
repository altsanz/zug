import { useEffect, useRef, useState } from 'react'
import type { AnnotationDraft, SegmentDraft } from '../segmenter.types'
import type { AnnotationType } from '../../../domain/types'
import styles from './Step2Annotate.module.css'

function fmt(s: number): string {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

interface Props {
  segments: SegmentDraft[]
  onSegmentsChange: (s: SegmentDraft[]) => void
  videoUrl: string
  onBack: () => void
  onNext: () => void
}

export function Step2Annotate({ segments, onSegmentsChange, videoUrl, onBack, onNext }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [segIdx, setSegIdx] = useState(0)
  const [relTime, setRelTime] = useState(0)
  const [adding, setAdding] = useState(false)
  const [addText, setAddText] = useState('')
  const [addType, setAddType] = useState<AnnotationType>('note')

  const seg = segments[segIdx]

  // Seek to segment start when segment changes
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = seg.startTime
    setRelTime(0)
    setAdding(false)
    setAddText('')
  }, [segIdx, seg.startTime])

  function handleTimeUpdate() {
    const video = videoRef.current
    if (!video) return
    if (video.currentTime >= seg.endTime) {
      video.pause()
      video.currentTime = seg.startTime
      setRelTime(0)
      return
    }
    setRelTime(Math.max(0, video.currentTime - seg.startTime))
  }

  function handlePlay() {
    const video = videoRef.current
    if (!video) return
    if (video.currentTime < seg.startTime || video.currentTime >= seg.endTime) {
      video.currentTime = seg.startTime
    }
  }

  function updateAnnotations(annotations: AnnotationDraft[]) {
    onSegmentsChange(
      segments.map((s, i) => (i === segIdx ? { ...s, annotations } : s))
    )
  }

  function confirmAdd() {
    const text = addText.trim()
    if (!text) return
    updateAnnotations([
      ...seg.annotations,
      { id: crypto.randomUUID(), timestamp: relTime, text, type: addType },
    ])
    setAdding(false)
    setAddText('')
    setAddType('note')
  }

  function seekTo(timestamp: number) {
    if (videoRef.current) {
      videoRef.current.currentTime = seg.startTime + timestamp
    }
  }

  function removeAnnotation(id: string) {
    updateAnnotations(seg.annotations.filter((a) => a.id !== id))
  }

  function goNext() {
    if (segIdx < segments.length - 1) {
      setSegIdx(segIdx + 1)
    } else {
      onNext()
    }
  }

  function goPrev() {
    if (segIdx > 0) setSegIdx(segIdx - 1)
  }

  return (
    <div className={styles.container}>
      <div className={styles.segNav}>
        <button className={styles.navArrow} onClick={goPrev} disabled={segIdx === 0}>←</button>
        <span className={styles.segTitle}>
          {seg.name}
          <span className={styles.segCounter}>{segIdx + 1} / {segments.length}</span>
        </span>
        <button
          className={styles.navArrow}
          onClick={() => segIdx < segments.length - 1 ? setSegIdx(segIdx + 1) : undefined}
          disabled={segIdx === segments.length - 1}
        >→</button>
      </div>

      <div className={styles.videoWrap}>
        <video
          ref={videoRef}
          className={styles.video}
          src={videoUrl}
          onTimeUpdate={handleTimeUpdate}
          onPlay={handlePlay}
          controls
        />
      </div>

      <div className={styles.annotationsPanel}>
        <div className={styles.annotationHeader}>
          <span className={styles.annotationTitle}>Annotations — {fmt(relTime)}</span>
          {!adding && (
            <button className={styles.addBtn} onClick={() => setAdding(true)}>
              + Add at {fmt(relTime)}
            </button>
          )}
        </div>

        <ul className={styles.list}>
          {seg.annotations.length === 0 && !adding && (
            <li className={styles.empty}>No annotations</li>
          )}
          {seg.annotations.map((a) => (
            <li key={a.id} className={styles.row}>
              <button className={styles.timestamp} onClick={() => seekTo(a.timestamp)}>
                {fmt(a.timestamp)}
              </button>
              <span className={styles.text}>{a.text}</span>
              <span className={`${styles.badge} ${styles[a.type]}`}>{a.type}</span>
              <button className={styles.deleteBtn} onClick={() => removeAnnotation(a.id)}>×</button>
            </li>
          ))}
          {adding && (
            <li className={styles.addRow}>
              <span className={styles.addTimestamp}>{fmt(relTime)}</span>
              <input
                className={styles.addInput}
                value={addText}
                placeholder="Observation…"
                onChange={(e) => setAddText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') confirmAdd()
                  if (e.key === 'Escape') { setAdding(false); setAddText('') }
                }}
                autoFocus
              />
              <select
                className={styles.typeSelect}
                value={addType}
                onChange={(e) => setAddType(e.target.value as AnnotationType)}
              >
                <option value="note">note</option>
                <option value="issue">issue</option>
                <option value="improvement">impr.</option>
                <option value="idea">idea</option>
              </select>
              <button className={styles.saveBtn} onClick={confirmAdd}>Add</button>
              <button
                className={styles.cancelBtn}
                onClick={() => { setAdding(false); setAddText('') }}
              >×</button>
            </li>
          )}
        </ul>
      </div>

      <div className={styles.footer}>
        <button className={styles.backBtn} onClick={onBack}>← Back</button>
        <div className={styles.footerRight}>
          {segIdx < segments.length - 1 ? (
            <button className={styles.nextSegBtn} onClick={goNext}>
              Next segment →
            </button>
          ) : (
            <button className={styles.processBtn} onClick={onNext}>
              Continue to Save →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
