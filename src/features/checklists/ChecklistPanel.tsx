import { useRef, useState } from 'react'
import { checklistsApi } from './checklists.api'
import { useLiveQuery } from '../../hooks/useLiveQuery'
import styles from './ChecklistPanel.module.css'

interface Props {
  movementId: number
}

export function ChecklistPanel({ movementId }: Props) {
  const { data: items = [] } = useLiveQuery(
    () => checklistsApi.getByMovement(movementId),
    [movementId]
  )
  const [adding, setAdding] = useState(false)
  const [newText, setNewText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function confirmAdd() {
    const text = newText.trim()
    if (text) await checklistsApi.add(movementId, text)
    setAdding(false)
    setNewText('')
  }

  function startAdding() {
    setAdding(true)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const doneCount = items.filter((i) => i.done).length

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.title}>
          Checklist
          {items.length > 0 && (
            <span className={styles.progress}>{doneCount}/{items.length}</span>
          )}
        </span>
        {!adding && (
          <button className={styles.addBtn} onClick={startAdding}>+ Add</button>
        )}
      </div>

      <ul className={styles.list}>
        {items.length === 0 && !adding && (
          <li className={styles.empty}>No checklist items</li>
        )}

        {items.map((item) => (
          <li key={item.id} className={styles.item}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={item.done}
              onChange={() => checklistsApi.toggle(item.id!, !item.done)}
            />
            <span className={`${styles.text} ${item.done ? styles.done : ''}`}>
              {item.text}
            </span>
            <button
              className={styles.deleteBtn}
              onClick={() => checklistsApi.remove(item.id!)}
            >×</button>
          </li>
        ))}

        {adding && (
          <li className={styles.addRow}>
            <input
              ref={inputRef}
              className={styles.addInput}
              value={newText}
              placeholder="Criterion…"
              onChange={(e) => setNewText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') confirmAdd()
                if (e.key === 'Escape') { setAdding(false); setNewText('') }
              }}
              onBlur={() => { if (!newText.trim()) { setAdding(false); setNewText('') } }}
            />
            <button className={styles.saveBtn} onClick={confirmAdd}>Add</button>
            <button className={styles.cancelBtn} onClick={() => { setAdding(false); setNewText('') }}>×</button>
          </li>
        )}
      </ul>
    </div>
  )
}
