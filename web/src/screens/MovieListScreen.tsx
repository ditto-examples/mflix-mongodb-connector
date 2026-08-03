import { Link } from 'react-router-dom'
import { Button, EmptyState, Input, ProgressSpinner } from '@dittolive/anvil'
import { useMovies } from '../hooks/useMovies'
import { useMovieSearch } from '../hooks/useMovieSearch'
import { MovieCard } from '../components/MovieCard'

// The browse + search screen (route: /). Two data sources, one grid:
// typing switches from the live observer list (useMovies) to one-shot
// search results (useMovieSearch); clearing switches back.
export function MovieListScreen() {
  const { movies, isLoading, error } = useMovies()
  const {
    searchResults,
    isSearching,
    searchError,
    searchQuery,
    setSearchQuery,
    clearSearch,
  } = useMovieSearch()

  if (error) return <EmptyState message={`Error loading movies: ${error}`} />
  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <ProgressSpinner />
      </div>
    )
  }

  const searching = searchQuery.trim().length > 0
  const shown = searching ? searchResults : movies

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end gap-3">
        <Input
          type="search"
          label="Search"
          placeholder="Search titles…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          containerClassName="w-72"
          errorMessage={searchError ?? undefined}
        />
        {searching && (
          <Button type="button" variant="secondary" onClick={clearSearch}>
            Clear
          </Button>
        )}
        <Button type="button" variant="primary" asChild>
          <Link to="/movies/new">Add movie</Link>
        </Button>
        <p className="text-foreground-subtle ml-auto text-sm">
          {searching
            ? isSearching
              ? 'Searching…'
              : `${searchResults.length.toLocaleString()} matches`
            : `${movies.length.toLocaleString()} movies synced${movies.length >= 2330 ? ' — full G/PG subset' : ' (syncing…)'}`}
        </p>
      </div>

      {searching && !isSearching && searchResults.length === 0 ? (
        <EmptyState message={`No titles match “${searchQuery.trim()}”.`} />
      ) : (
        // auto-fill: the browser fits as many 160px-minimum columns as the
        // window allows and stretches them to fill — no breakpoint list.
        <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4">
          {shown.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </>
  )
}
