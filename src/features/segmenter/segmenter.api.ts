import { db } from '../../db/db'
import type { SegmentDraft } from './segmenter.types'

export async function saveSegments(
  segments: SegmentDraft[],
  fileHandles: FileSystemFileHandle[],
  sessionDate: number
): Promise<number[]> {
  const videoIds: number[] = []

  await db.transaction('rw', db.videos, db.annotations, async () => {
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i]
      const handle = fileHandles[i]

      const videoId = await db.videos.add({
        movementId: seg.movementId,
        fileHandle: handle,
        createdAt: sessionDate,
      })

      videoIds.push(videoId)

      if (seg.annotations.length > 0) {
        await db.annotations.bulkAdd(
          seg.annotations.map((a) => ({
            videoId,
            timestamp: a.timestamp, // seconds relative to clip start
            text: a.text,
            type: a.type,
          }))
        )
      }
    }
  })

  return videoIds
}
