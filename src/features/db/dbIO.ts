import { db } from '../../db/db'
import type { Movement, Video, Annotation, ChecklistItem } from '../../db/db'

interface ExportedVideo extends Omit<Video, 'fileHandle'> {
  fileName?: string
}

interface ExportData {
  version: 1
  exportedAt: number
  movements: Movement[]
  videos: ExportedVideo[]
  annotations: Annotation[]
  checklists: ChecklistItem[]
}

export async function exportDatabase(): Promise<void> {
  const [movements, videos, annotations, checklists] = await Promise.all([
    db.movements.toArray(),
    db.videos.toArray(),
    db.annotations.toArray(),
    db.checklists.toArray(),
  ])

  const exportedVideos: ExportedVideo[] = videos.map(({ fileHandle, ...rest }) => ({
    ...rest,
    fileName: fileHandle?.name ?? rest.fileName,
  }))

  const data: ExportData = {
    version: 1,
    exportedAt: Date.now(),
    movements,
    videos: exportedVideos,
    annotations,
    checklists,
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `break-trainer-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export async function importDatabase(file: File): Promise<void> {
  const text = await file.text()
  const data: ExportData = JSON.parse(text)

  if (data.version !== 1) throw new Error(`Unsupported backup version: ${data.version}`)

  await db.transaction('rw', [db.movements, db.videos, db.annotations, db.checklists], async () => {
    await db.movements.clear()
    await db.videos.clear()
    await db.annotations.clear()
    await db.checklists.clear()

    if (data.movements.length) await db.movements.bulkAdd(data.movements)
    if (data.videos.length) await db.videos.bulkAdd(data.videos)
    if (data.annotations.length) await db.annotations.bulkAdd(data.annotations)
    if (data.checklists.length) await db.checklists.bulkAdd(data.checklists)
  })
}

export async function relinkVideosFromFolder(): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const showDirectoryPicker = (window as any).showDirectoryPicker as
    (opts: { mode: string }) => Promise<{ entries(): AsyncIterable<[string, { kind: string }]> }>

  let dirHandle: { entries(): AsyncIterable<[string, { kind: string }]> }
  try {
    dirHandle = await showDirectoryPicker({ mode: 'read' })
  } catch {
    return // user cancelled
  }

  const folderFiles = new Map<string, FileSystemFileHandle>()
  for await (const [name, entry] of dirHandle.entries()) {
    if (entry.kind === 'file') {
      folderFiles.set(name, entry as unknown as FileSystemFileHandle)
    }
  }

  const allVideos = await db.videos.toArray()
  const unlinked = allVideos.filter((v) => !v.fileHandle && v.fileName)

  let relinkedCount = 0
  await Promise.all(
    unlinked.map(async (video) => {
      const match = folderFiles.get(video.fileName!)
      if (!match) return
      await db.videos.update(video.id!, { fileHandle: match })
      relinkedCount++
    })
  )

  alert(`Relinked ${relinkedCount} of ${unlinked.length} video${unlinked.length !== 1 ? 's' : ''}.`)
}
