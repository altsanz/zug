import type { Annotation } from '../../db/db'
import styles from './AnnotationTimeline.module.css'

const TYPE_COLOR: Record<Annotation['type'], string> = {
  note: 'var(--accent)',
  issue: '#ff5f5f',
  improvement: '#4dffb4',
  idea: '#c084fc',
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

interface Props {
  annotations: Annotation[]
  duration: number
  onSeek: (t: number) => void
}

export function AnnotationTimeline({ annotations, duration, onSeek }: Props) {
  if (!duration) return null

  return (
    <div className={styles.bar}>
      {annotations.map((a) => (
        <button
          key={a.id}
          className={styles.tick}
          style={{
            left: `${(a.timestamp / duration) * 100}%`,
            background: TYPE_COLOR[a.type],
          }}
          title={`${formatTime(a.timestamp)} — ${a.text}`}
          onClick={() => onSeek(a.timestamp)}
        />
      ))}
    </div>
  )
}
