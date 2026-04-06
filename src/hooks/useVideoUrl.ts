import { useEffect, useState } from 'react'
import { ensurePermission, getVideoURL } from '../lib/fileSystem'

export function useVideoUrl(handle: FileSystemFileHandle) {
  const [url, setUrl] = useState<string>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      await ensurePermission(handle)
      const u = await getVideoURL(handle)
      if (!cancelled) {
        setUrl(u)
        setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [handle])

  return { url, loading }
}
