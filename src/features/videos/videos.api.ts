import { db } from '../../db/db'
import { pickVideoFiles } from '../../lib/fileSystem'

export const videosApi = {
  getByMovement: (movementId: number) =>
    db.videos.where('movementId').equals(movementId).sortBy('createdAt'),

  add: async (movementId: number) => {
    const picked = await pickVideoFiles()
    if (picked.length === 0) return

    const existing = await db.videos.where('movementId').equals(movementId).toArray()

    const newHandles = await Promise.all(
      picked.map(async (handle) => {
        for (const v of existing) {
          if (v.fileHandle && await handle.isSameEntry(v.fileHandle)) return null
        }
        return handle
      })
    )

    await Promise.all(
      newHandles
        .filter((h): h is FileSystemFileHandle => h !== null)
        .map(async (handle) => {
          const file = await handle.getFile()
          return db.videos.add({
            movementId,
            fileHandle: handle,
            createdAt: file.lastModified,
          })
        })
    )
  },

  updateDate: (id: number, createdAt: number) =>
    db.videos.update(id, { createdAt }),

  remove: (id: number) => db.videos.delete(id),
}
