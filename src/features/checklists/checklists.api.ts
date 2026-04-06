import { db } from '../../db/db'

export const checklistsApi = {
  getByMovement: (movementId: number) =>
    db.checklists.where('movementId').equals(movementId).sortBy('createdAt'),

  add: (movementId: number, text: string) =>
    db.checklists.add({ movementId, text, done: false, createdAt: Date.now() }),

  toggle: (id: number, done: boolean) =>
    db.checklists.update(id, { done }),

  remove: (id: number) => db.checklists.delete(id),
}
