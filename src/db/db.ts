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
  type: 'note' | 'issue' | 'improvement'
}

class AppDB extends Dexie {
  movements!: Table<Movement, number>
  videos!: Table<Video, number>
  annotations!: Table<Annotation, number>

  constructor() {
    super('BreakTrainerDB')

    this.version(1).stores({
      movements: '++id, name, createdAt',
      videos: '++id, movementId, createdAt',
      annotations: '++id, videoId, timestamp'
    })
  }
}

export const db = new AppDB()