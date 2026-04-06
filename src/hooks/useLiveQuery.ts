import { useEffect, useState } from 'react'
import { liveQuery } from 'dexie'

export function useLiveQuery<T>(
  queryFn: () => Promise<T>,
  deps: any[] = []
) {
  const [data, setData] = useState<T | undefined>(undefined)
  const [error, setError] = useState<any>(null)

  useEffect(() => {
    const observable = liveQuery(queryFn)

    const subscription = observable.subscribe({
      next: (result) => setData(result),
      error: (err) => setError(err)
    })

    return () => subscription.unsubscribe()
  }, deps)

  return { data, error }
}