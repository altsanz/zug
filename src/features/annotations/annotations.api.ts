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
    db.annotations.add({
      videoId,
      timestamp,
      text,
      type
    })
}