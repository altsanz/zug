import { db } from '../../db/db'
import { pickVideoFile } from '../../lib/fileSystem'

export const videosApi = {
  getByMovement: (movementId: number) =>
    db.videos.where('movementId').equals(movementId).sortBy('createdAt'),

  add: async (movementId: number) => {
    const handle = await pickVideoFile()

    return db.videos.add({
      movementId,
      fileHandle: handle,
      createdAt: Date.now()
    })
  },

  remove: (id: number) => db.videos.delete(id),
}