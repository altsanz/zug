import { useEffect, useRef, useState } from 'react'
import { Outlet, useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from '../../hooks/useLiveQuery'
import { movementsApi } from './movements.api'
import { db } from '../../db/db'
import styles from './MovementsLayout.module.css'

export function MovementsLayout() {
  const navigate = useNavigate()
  const { movementId } = useParams()
  const selectedId = movementId ? Number(movementId) : null

  const { data: movements = [] } = useLiveQuery(() => movementsApi.getAll())
  const { data: allVideos = [] } = useLiveQuery(() => db.videos.toArray())

  const videoCounts: Record<number, number> = {}
  for (const v of allVideos) {
    videoCounts[v.movementId] = (videoCounts[v.movementId] ?? 0) + 1
  }

  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (adding) inputRef.current?.focus()
  }, [adding])

  async function confirmAdd() {
    const name = newName.trim()
    if (name) await movementsApi.create(name)
    setAdding(false)
    setNewName('')
  }

  function cancelAdd() {
    setAdding(false)
    setNewName('')
  }

  async function deleteMovement(id: number) {
    await movementsApi.remove(id)
    setPendingDeleteId(null)
    if (selectedId === id) navigate('/')
  }

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>Movements</div>

        <ul className={styles.list}>
          {movements.length === 0 && !adding && (
            <li className={styles.listEmpty}>No movements yet</li>
          )}

          {movements.map((m) => (
            <li
              key={m.id}
              className={`${styles.item} ${selectedId === m.id ? styles.itemSelected : ''}`}
              onClick={() => {
                if (pendingDeleteId !== m.id) navigate(`/movements/${m.id}`)
              }}
            >
              <span className={styles.itemName}>{m.name}</span>

              {pendingDeleteId === m.id ? (
                <div className={styles.confirmDelete} onClick={(e) => e.stopPropagation()}>
                  <span className={styles.confirmLabel}>Delete?</span>
                  <button className={styles.confirmYes} onClick={() => deleteMovement(m.id!)}>Yes</button>
                  <button className={styles.confirmNo} onClick={() => setPendingDeleteId(null)}>Cancel</button>
                </div>
              ) : (
                <>
                  {videoCounts[m.id!] != null && (
                    <span className={styles.badge}>{videoCounts[m.id!]}</span>
                  )}
                  <button
                    className={styles.deleteBtn}
                    onClick={(e) => { e.stopPropagation(); setPendingDeleteId(m.id!) }}
                  >×</button>
                </>
              )}
            </li>
          ))}

          {adding && (
            <li className={styles.addRow}>
              <input
                ref={inputRef}
                className={styles.addInput}
                value={newName}
                placeholder="Movement name"
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') confirmAdd()
                  if (e.key === 'Escape') cancelAdd()
                }}
                onBlur={cancelAdd}
              />
            </li>
          )}
        </ul>

        <div className={styles.sidebarFooter}>
          {!adding && (
            <button className={styles.addBtn} onClick={() => setAdding(true)}>
              + New movement
            </button>
          )}
        </div>
      </aside>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
