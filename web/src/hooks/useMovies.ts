import { useEffect, useState } from 'react'
import { useDitto } from '../providers/DittoContext'
import { movieListingFromJson, type MovieListing } from '../models/movieListing'

// Projection trick from rn-expo: the list observer pulls card fields only;
// the detail view (useMovie) does SELECT * on a single document.
const MOVIES_QUERY =
  'SELECT _id, plot, poster, title, year FROM movies ORDER BY year DESC'

// The archetype read hook: a Ditto store observer wrapped in React state.
// The observer fires on every local-store change (including each incoming
// sync batch), so consumers re-render as data arrives — nobody polls.
//
// Deliberate deviation from rn-expo's useMovies: that version registers the
// observer once, parks it on the service, caches results in refs, and never
// cancels — a mobile-app-lifetime assumption. Here the observer lives and
// dies with the consuming component (register on mount, cancel on unmount),
// which is StrictMode-safe, testable, and costs nothing against an in-memory
// store. The rn-expo version's cache/ref machinery falls away entirely.
export function useMovies() {
  const { dittoService, isInitialized } = useDitto()
  const [movies, setMovies] = useState<MovieListing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Ditto not ready yet: stay in the loading state. The provider flips
    // isInitialized, which re-runs this effect.
    if (!isInitialized) return

    try {
      const observer = dittoService.getDitto().store.registerObserver(
        MOVIES_QUERY,
        (result) => {
          setMovies(result.items.map((item) => movieListingFromJson(item.value)))
          setIsLoading(false)
        }
      )
      return () => observer.cancel()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch movies')
      setIsLoading(false)
    }
  }, [dittoService, isInitialized])

  return { movies, isLoading, error }
}
