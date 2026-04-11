import { useEffect, useState } from 'react'
import { ensurePermission, getVideoURL } from '../lib/fileSystem'

export function useVideoUrl(handle: FileSystemFileHandle | undefined, enabled = true) {
  const [url, setUrl] = useState<string>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!enabled || !handle) {
      setUrl(undefined)
      setLoading(false)
      return
    }
    let cancelled = false
    async function load() {
      setLoading(true)
      await ensurePermission(handle!)
      const u = await getVideoURL(handle!)
      if (!cancelled) {
        setUrl(u)
        setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [handle, enabled])

  return { url, loading }
}
