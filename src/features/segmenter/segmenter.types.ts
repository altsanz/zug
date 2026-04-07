import type { AnnotationType } from '../../domain/types'

export interface AnnotationDraft {
  id: string
  timestamp: number // seconds relative to segment start
  text: string
  type: AnnotationType
}

export interface SegmentDraft {
  id: string
  name: string
  movementId: number
  startTime: number // seconds in source video
  endTime: number   // seconds in source video
  annotations: AnnotationDraft[]
}
