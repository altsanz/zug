import { db } from '../../db/db'

type AnnotationType = 'note' | 'issue' | 'improvement' | 'idea'

export const annotationsApi = {
  getByVideo: (videoId: number) =>
    db.annotations.where('videoId').equals(videoId).sortBy('timestamp'),

  add: (
    videoId: number,
    timestamp: number,
    text: string,
    type: AnnotationType
  ) =>
    db.annotations.add({ videoId, timestamp, text, type }),

  update: (id: number, text: string, type: AnnotationType) =>
    db.annotations.update(id, { text, type }),

  getAll: () => db.annotations.toArray(),

  remove: (id: number) => db.annotations.delete(id),
}