import { db } from '../../db/db'

export const movementsApi = {
  getAll: () => db.movements.toArray(),

  create: (name: string) =>
    db.movements.add({
      name,
      createdAt: Date.now()
    }),

  remove: async (id: number) => {
    await db.videos.where('movementId').equals(id).delete()
    await db.movements.delete(id)
  },
}