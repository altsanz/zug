export {}

declare global {
  interface Window {
    showOpenFilePicker: (options?: {
      types?: Array<{
        description?: string
        accept: Record<string, string[]>
      }>
      multiple?: boolean
    }) => Promise<FileSystemFileHandle[]>
  }

  interface FileSystemHandlePermissionDescriptor {
    mode?: 'read' | 'readwrite'
  }

  interface FileSystemHandle {
    kind: 'file' | 'directory'
    name: string
    isSameEntry(other: FileSystemHandle): Promise<boolean>
  }

  interface FileSystemFileHandle extends FileSystemHandle {
    getFile(): Promise<File>

    queryPermission?: (
      descriptor?: FileSystemHandlePermissionDescriptor
    ) => Promise<PermissionState>

    requestPermission?: (
      descriptor?: FileSystemHandlePermissionDescriptor
    ) => Promise<PermissionState>
  }
}