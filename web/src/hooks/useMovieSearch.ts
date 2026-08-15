import { useCallback, useEffect, useState } from 'react'
import { useDitto } from '../providers/DittoContext'
import { movieListingFromJson, type MovieListing } from '../models/movieListing'

// Trailing debounce: queries run 200ms after the user stops typing, not on
// every keystroke like the rn-expo version (PORT_SPEC bug #3).
const SEARCH_DEBOUNCE_MS = 200

// The search must re-apply the G/PG filter even though the subscription only
// syncs G/PG: local writes (useAddMovie) could insert anything, and the
// filter documents intent. Deviation from rn-expo: the imdb/tomatoes rating
// projections are dropped — the original fetched them and then discarded
// them in conversion (MovieListing has no rating fields).
// DQL LIKE is case-sensitive; lower() on the column plus a pre-lowercased
// search term makes matching case-insensitive ("toy story" finds "Toy Story").
const SEARCH_QUERY = `SELECT _id, plot, poster, title, year
  FROM movies
  WHERE lower(title) LIKE :searchTerm AND (rated = 'G' OR rated = 'PG')
  ORDER BY year DESC`

// One-shot search hook. Further fixes vs rn-expo: Ditto comes through
// useDitto() instead of DittoService.getInstance() (the provider is the only
// door — that's the test seam), and results convert via the shared
// movieListingFromJson instead of an inline copy of it.
export function useMovieSearch() {
  const { dittoService, isInitialized } = useDitto()
  const [searchResults, setSearchResults] = useState<MovieListing[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const trimmed = searchQuery.trim()
    if (!isInitialized || !trimmed) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    setSearchError(null)
    // Previous results stay visible until new ones land (Aaron's UX call,
    // kept — no flicker while typing).

    // `stale` covers both cancellation paths: a newer keystroke during the
    // debounce window (timer cleared) and a slow query finishing after a
    // newer one already rendered (result dropped).
    let stale = false
    const timer = setTimeout(async () => {
      try {
        const result = await dittoService
          .getDitto()
          .store.execute(SEARCH_QUERY, { searchTerm: `%${trimmed.toLowerCase()}%` })
        if (stale) return
        setSearchResults(result.items.map((item) => movieListingFromJson(item.value)))
        setIsSearching(false)
      } catch (err) {
        if (stale) return
        setSearchError(err instanceof Error ? err.message : 'Failed to search movies')
        setSearchResults([])
        setIsSearching(false)
      }
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      stale = true
      clearTimeout(timer)
    }
  }, [dittoService, isInitialized, searchQuery])

  const clearSearch = useCallback(() => {
    setSearchQuery('')
    setSearchResults([])
    setIsSearching(false)
    setSearchError(null)
  }, [])

  return {
    searchResults,
    isSearching,
    searchError,
    searchQuery,
    setSearchQuery,
    clearSearch,
  }
}
