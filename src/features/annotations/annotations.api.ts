import { db } from '../../db/db'

export const annotationsApi = {
  getByVideo: (videoId: number) =>
    db.annotations.where('videoId').equals(videoId).sortBy('timestamp'),

  add: (
    videoId: number,
    timestamp: number,
    text: string,
    type: 'note' | 'issue' | 'improvement'
  ) =>
    db.annotations.add({ videoId, timestamp, text, type }),

  update: (id: number, text: string, type: 'note' | 'issue' | 'improvement') =>
    db.annotations.update(id, { text, type }),

  remove: (id: number) => db.annotations.delete(id),
}