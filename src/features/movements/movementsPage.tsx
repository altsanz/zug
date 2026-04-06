import { useEffect, useRef, useState } from 'react'
import { movementsApi } from './movements.api'
import { videosApi } from '../videos/videos.api'
import { VideoPlayer } from '../videos/videoPlayer'
import { VideoAnnotator } from '../videos/VideoAnnotator'
import { VideoComparison } from '../videos/VideoComparison'
import { ChecklistPanel } from '../checklists/ChecklistPanel'
import type { Movement, Video } from '../../db/db'
import styles from './movementsPage.module.css'

export function MovementsPage() {
  const [movements, setMovements] = useState<Movement[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [videos, setVideos] = useState<Video[]>([])
  const [videoCounts, setVideoCounts] = useState<Record<number, number>>({})
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null)
  const [openVideoId, setOpenVideoId] = useState<number | null>(null)
  const [comparing, setComparing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function loadMovements() {
    const ms = await movementsApi.getAll()
    setMovements(ms)
    const counts: Record<number, number> = {}
    await Promise.all(
      ms.map(async (m) => {
        const vs = await videosApi.getByMovement(m.id!)
        counts[m.id!] = vs.length
      })
    )
    setVideoCounts(counts)
  }

  async function loadVideos(movementId: number) {
    const vs = await videosApi.getByMovement(movementId)
    setVideos(vs)
  }

  useEffect(() => {
    loadMovements()
  }, [])

  useEffect(() => {
    if (selected != null) {
      loadVideos(selected)
    } else {
      setVideos([])
    }
    setOpenVideoId(null)
    setComparing(false)
  }, [selected])

  useEffect(() => {
    if (adding) inputRef.current?.focus()
  }, [adding])

  async function confirmAdd() {
    const name = newName.trim()
    if (name) {
      await movementsApi.create(name)
      await loadMovements()
    }
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
    if (selected === id) setSelected(null)
    await loadMovements()
  }

  async function deleteVideo(id: number) {
    await videosApi.remove(id)
    setOpenVideoId(null)
    if (selected != null) await loadVideos(selected)
    await loadMovements()
  }

  const selectedMovement = movements.find((m) => m.id === selected)
  const openVideo = videos.find((v) => v.id === openVideoId)

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>Movements</div>

        <ul className={styles.list}>
          {movements.length === 0 && !adding && (
            <li className={styles.listEmpty}>No movements yet</li>
          )}

          {movements.map((m) => (
            <li
              key={m.id}
              className={`${styles.item} ${selected === m.id ? styles.itemSelected : ''}`}
              onClick={() => {
                if (pendingDeleteId !== m.id) setSelected(m.id!)
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
                    onClick={(e) => {
                      e.stopPropagation()
                      setPendingDeleteId(m.id!)
                    }}
                  >
                    ×
                  </button>
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

      {/* Main panel */}
      <main className={styles.main}>
        {selected == null ? (
          <div className={styles.emptyPanel}>
            <p>Select a movement</p>
          </div>
        ) : openVideo != null ? (
          <VideoAnnotator
            video={openVideo}
            onBack={() => setOpenVideoId(null)}
            onDelete={() => deleteVideo(openVideo.id!)}
          />
        ) : comparing ? (
          <VideoComparison
            videos={videos}
            onBack={() => setComparing(false)}
          />
        ) : (
          <>
            <div className={styles.panelHeader}>
              <span className={styles.panelTitle}>{selectedMovement?.name}</span>
              <div className={styles.panelActions}>
                {videos.length >= 2 && (
                  <button className={styles.compareBtn} onClick={() => setComparing(true)}>
                    Compare
                  </button>
                )}
                <button
                  className={styles.addVideoBtn}
                  onClick={async () => {
                    await videosApi.add(selected)
                    await loadVideos(selected)
                    await loadMovements()
                  }}
                >
                  + Add video
                </button>
              </div>
            </div>

            <div className={styles.panelContent}>
              {videos.length === 0 ? (
                <div className={styles.emptyPanel}>
                  <p>No videos yet</p>
                </div>
              ) : (
                <div className={styles.videoList}>
                  {videos.map((v) => (
                    <VideoPlayer
                      key={v.id}
                      handle={v.fileHandle}
                      createdAt={v.createdAt}
                      onDelete={() => deleteVideo(v.id!)}
                      onClick={() => setOpenVideoId(v.id!)}
                    />
                  ))}
                </div>
              )}
            </div>

            <ChecklistPanel movementId={selected} />
          </>
        )}
      </main>
    </div>
  )
}
