import { useRef, useState } from 'react'
import { annotationsApi } from './annotations.api'
import type { Annotation } from '../../db/db'
import styles from './AnnotationPanel.module.css'

type AnnotationType = 'note' | 'issue' | 'improvement'

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

interface Props {
  annotations: Annotation[]
  currentTime: number
  videoId: number
  onSeek: (t: number) => void
  onMutate: () => void
}

export function AnnotationPanel({ annotations, currentTime, videoId, onSeek, onMutate }: Props) {
  const [adding, setAdding] = useState(false)
  const [addText, setAddText] = useState('')
  const [addType, setAddType] = useState<AnnotationType>('note')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editText, setEditText] = useState('')
  const [editType, setEditType] = useState<AnnotationType>('note')
  const addRef = useRef<HTMLInputElement>(null)

  async function confirmAdd() {
    const text = addText.trim()
    if (text) {
      await annotationsApi.add(videoId, currentTime, text, addType)
      onMutate()
    }
    setAdding(false)
    setAddText('')
    setAddType('note')
  }

  function startEdit(a: Annotation) {
    setEditingId(a.id!)
    setEditText(a.text)
    setEditType(a.type)
  }

  async function confirmEdit(id: number) {
    const text = editText.trim()
    if (text) {
      await annotationsApi.update(id, text, editType)
      onMutate()
    }
    setEditingId(null)
  }

  async function deleteAnnotation(id: number) {
    await annotationsApi.remove(id)
    onMutate()
  }

  function startAdding() {
    setAdding(true)
    setTimeout(() => addRef.current?.focus(), 0)
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.title}>Annotations</span>
        {!adding && (
          <button className={styles.addBtn} onClick={startAdding}>
            + Add at {formatTime(currentTime)}
          </button>
        )}
      </div>

      <ul className={styles.list}>
        {annotations.length === 0 && !adding && (
          <li className={styles.empty}>No annotations yet</li>
        )}

        {annotations.map((a) => (
          <li key={a.id} className={styles.row}>
            <button className={styles.timestamp} onClick={() => onSeek(a.timestamp)}>
              {formatTime(a.timestamp)}
            </button>

            {editingId === a.id ? (
              <div className={styles.editRow}>
                <input
                  className={styles.editInput}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') confirmEdit(a.id!)
                    if (e.key === 'Escape') setEditingId(null)
                  }}
                  autoFocus
                />
                <select
                  className={styles.typeSelect}
                  value={editType}
                  onChange={(e) => setEditType(e.target.value as AnnotationType)}
                >
                  <option value="note">note</option>
                  <option value="issue">issue</option>
                  <option value="improvement">impr.</option>
                </select>
                <button className={styles.saveBtn} onClick={() => confirmEdit(a.id!)}>Save</button>
                <button className={styles.cancelBtn} onClick={() => setEditingId(null)}>×</button>
              </div>
            ) : (
              <>
                <span className={styles.text} onClick={() => startEdit(a)}>{a.text}</span>
                <span className={`${styles.typeBadge} ${styles[a.type]}`}>{a.type}</span>
                <button className={styles.deleteBtn} onClick={() => deleteAnnotation(a.id!)}>×</button>
              </>
            )}
          </li>
        ))}

        {adding && (
          <li className={styles.addRow}>
            <span className={styles.addTimestamp}>{formatTime(currentTime)}</span>
            <input
              ref={addRef}
              className={styles.addInput}
              value={addText}
              placeholder="Observation…"
              onChange={(e) => setAddText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') confirmAdd()
                if (e.key === 'Escape') { setAdding(false); setAddText('') }
              }}
            />
            <select
              className={styles.typeSelect}
              value={addType}
              onChange={(e) => setAddType(e.target.value as AnnotationType)}
            >
              <option value="note">note</option>
              <option value="issue">issue</option>
              <option value="improvement">impr.</option>
            </select>
            <button className={styles.saveBtn} onClick={confirmAdd}>Add</button>
            <button className={styles.cancelBtn} onClick={() => { setAdding(false); setAddText('') }}>×</button>
          </li>
        )}
      </ul>
    </div>
  )
}
