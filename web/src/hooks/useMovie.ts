import { useCallback, useEffect, useRef, useState } from 'react'
import { useDitto } from '../providers/DittoContext'
import { movieFromJson, type Movie } from '../models/movie'

// Detail-view hook: one-shot fetch of a single movie by _id, plus a manual
// refresh() (the edit screen calls it after saving). No observer — the detail
// view doesn't need live updates in v1, so there's nothing to clean up.
//
// movieId is bound as a DQL parameter (:movieId), never interpolated into
// the query string — same discipline as every read/write in this app.
export function useMovie(movieId: string) {
  const { dittoService, isInitialized } = useDitto()
  const [movie, setMovie] = useState<Movie | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Out-of-order guard: rapid movieId changes (or a refresh racing a
  // navigation) can resolve out of order — only the newest request may
  // write state. A ref token covers both the effect path and refresh().
  const requestRef = useRef(0)

  const fetchMovie = useCallback(async () => {
    if (!isInitialized || !movieId) return
    const requestId = ++requestRef.current
    try {
      const result = await dittoService
        .getDitto()
        .store.execute('SELECT * FROM movies WHERE _id = :movieId', { movieId })

      // Fix of rn-expo bug #2 (PORT_SPEC): the original checked
      // `items !== null`, but an empty result is [] — never null — so the
      // not-found branch was unreachable and items[0].value crashed instead.
      if (requestId !== requestRef.current) return // stale — a newer fetch won

      if (result.items.length > 0) {
        setMovie(movieFromJson(result.items[0].value))
        setError(null) // a successful refresh clears any earlier failure
      } else {
        setError('Movie not found')
      }
    } catch (err) {
      if (requestId !== requestRef.current) return
      setError(err instanceof Error ? err.message : 'Failed to fetch movie')
    } finally {
      if (requestId === requestRef.current) setIsLoading(false)
    }
  }, [dittoService, isInitialized, movieId])

  useEffect(() => {
    fetchMovie()
  }, [fetchMovie])

  return { movie, isLoading, error, refresh: fetchMovie }
}
