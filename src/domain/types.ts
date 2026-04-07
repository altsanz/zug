export type MovementId = number
export type VideoId = number
export type AnnotationId = number

export interface Movement {
  id: MovementId
  name: string
  description?: string
  createdAt: number
}

export interface Video {
  id: VideoId
  movementId: MovementId
  sessionId?: number
  createdAt: number
}

export type AnnotationType = 'note' | 'issue' | 'improvement' | 'idea'

export interface Annotation {
  id: AnnotationId
  videoId: VideoId
  timestamp: number
  text: string
  type: AnnotationType 
}

export interface Session {
  id: number
  date: number
  notes?: string
}

export type ChecklistItemId = number

export interface ChecklistItem {
  id: ChecklistItemId
  movementId: MovementId
  text: string
  done: boolean
  createdAt: number
}