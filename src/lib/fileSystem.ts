export async function pickVideoFiles(): Promise<FileSystemFileHandle[]> {
  return window.showOpenFilePicker({
    multiple: true,
    types: [
      {
        description: 'Videos',
        accept: { 'video/*': ['.mp4', '.mov'] }
      }
    ]
  })
}

export async function getVideoURL(handle: FileSystemFileHandle) {
  const file = await handle.getFile()
  return URL.createObjectURL(file)
}

export async function ensurePermission(handle: FileSystemFileHandle) {
  const opts = { mode: 'read' as const }

  if (handle.queryPermission) {
    const permission = await handle.queryPermission(opts)

    if (permission !== 'granted' && handle.requestPermission) {
      await handle.requestPermission(opts)
    }
  }
}