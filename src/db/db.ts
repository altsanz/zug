import Dexie, { Table } from 'dexie'

export interface Movement {
  id?: number
  name: string
  createdAt: number
}

export interface Video {
  id?: number
  movementId: number
  fileHandle: FileSystemFileHandle
  createdAt: number
}

export interface Annotation {
  id?: number
  videoId: number
  timestamp: number
  text: string
  type: 'note' | 'issue' | 'improvement' | 'idea'
}

export interface ChecklistItem {
  id?: number
  movementId: number
  text: string
  done: boolean
  createdAt: number
}

class AppDB extends Dexie {
  movements!: Table<Movement, number>
  videos!: Table<Video, number>
  annotations!: Table<Annotation, number>
  checklists!: Table<ChecklistItem, number>

  constructor() {
    super('BreakTrainerDB')

    this.version(1).stores({
      movements: '++id, name, createdAt',
      videos: '++id, movementId, createdAt',
      annotations: '++id, videoId, timestamp'
    })

    this.version(2).stores({
      movements: '++id, name, createdAt',
      videos: '++id, movementId, createdAt',
      annotations: '++id, videoId, timestamp',
      checklists: '++id, movementId, done'
    })
    
  }
}

export const db = new AppDB()