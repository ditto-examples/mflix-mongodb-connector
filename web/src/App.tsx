import { useState } from 'react'
import { useDitto } from './providers/DittoContext'
import { useMovies } from './hooks/useMovies'
import { useMovie } from './hooks/useMovie'
import { useMovieSearch } from './hooks/useMovieSearch'
import { useUpdateMovie } from './hooks/useUpdateMovie'
import { useComments } from './hooks/useComments'
import { formatRelativeDate } from './models/comment'
import type { Movie } from './models/movie'
import './App.css'

// Temporary smoke-test UI for the provider pattern: renders the three context
// states (initializing / error / connected). Replaced by the real screens in
// phase 4.3 — but MovieCount below is an honest preview of how every future
// hook consumes the context.
function App() {
  const { isInitialized, error } = useDitto()

  if (error) {
    return (
      <main>
        <h1>Ditto error</h1>
        <p>{error.message}</p>
      </main>
    )
  }

  if (!isInitialized) {
    return (
      <main>
        <h1>Initializing Ditto…</h1>
        <p>Loading wasm engine and connecting.</p>
      </main>
    )
  }

  return (
    <main>
      <h1>Connected</h1>
      <MovieBrowser />
    </main>
  )
}

// Interim proof of the real hooks, until 4.4 builds the actual screens:
// useMovies drives the clickable title list, useMovie drives the detail
// panel. Neither component knows Ditto exists — that's the point.
function MovieBrowser() {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  return selectedId ? (
    <MovieDetail movieId={selectedId} onBack={() => setSelectedId(null)} />
  ) : (
    <MovieList onSelect={setSelectedId} />
  )
}

function MovieList({ onSelect }: { onSelect: (id: string) => void }) {
  const { movies, isLoading, error } = useMovies()
  const {
    searchResults,
    isSearching,
    searchError,
    searchQuery,
    setSearchQuery,
    clearSearch,
  } = useMovieSearch()

  if (error) return <p>Error loading movies: {error}</p>
  if (isLoading) return <p>Loading movies…</p>

  // Typing switches the list from "browse" (observer) to "search" (one-shot
  // LIKE query); clearing switches back.
  const searching = searchQuery.trim().length > 0
  const shown = searching ? searchResults : movies.slice(0, 10)

  return (
    <>
      <p>
        {movies.length.toLocaleString()} movies synced
        {movies.length >= 2330 ? ' — full G/PG subset ✓' : ' (syncing…)'}
      </p>
      <p>
        <input
          type="search"
          placeholder="Search titles…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searching && (
          <button type="button" onClick={clearSearch}>
            Clear
          </button>
        )}
      </p>
      {searchError && <p>Search error: {searchError}</p>}
      {searching && (
        <p>
          {isSearching
            ? 'Searching…'
            : `${searchResults.length.toLocaleString()} matches`}
        </p>
      )}
      <ul>
        {shown.map((movie) => (
          <li key={movie.id}>
            <button type="button" onClick={() => onSelect(movie.id)}>
              {movie.title} ({movie.year})
            </button>
          </li>
        ))}
      </ul>
    </>
  )
}

function MovieDetail({
  movieId,
  onBack,
}: {
  movieId: string
  onBack: () => void
}) {
  const { movie, isLoading, error, refresh } = useMovie(movieId)
  const [isEditing, setIsEditing] = useState(false)

  if (error) return <p>Error: {error}</p>
  if (isLoading || !movie) return <p>Loading movie…</p>

  return (
    <>
      <button type="button" onClick={onBack}>
        ← Back to list
      </button>
      {isEditing ? (
        <EditMovieForm
          movie={movie}
          onDone={async () => {
            // The detail query is one-shot, so re-fetch to show saved values.
            await refresh()
            setIsEditing(false)
          }}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <>
          <h2>
            {movie.title} ({movie.year})
          </h2>
          <p>
            Rated {movie.rated} · {movie.runtime} min ·{' '}
            {movie.genres.join(', ') || 'no genres'}
          </p>
          <p>{movie.fullplot || movie.plot}</p>
          <p>Cast: {movie.cast.join(', ') || 'unknown'}</p>
          <p>Directed by: {movie.directors.join(', ') || 'unknown'}</p>
          <button type="button" onClick={() => setIsEditing(true)}>
            Edit
          </button>
          <CommentsSection movieId={movieId} />
        </>
      )}
    </>
  )
}

// Live comments via the observer-per-parameter pattern. New comments appear
// without any refresh — ours instantly, other devices' as sync delivers
// them. This is the second half of the two-way sync demo.
function CommentsSection({ movieId }: { movieId: string }) {
  const { comments, isLoading, error, addComment } = useComments(movieId)
  const [draft, setDraft] = useState('')
  const [postError, setPostError] = useState<string | null>(null)

  const post = async () => {
    const text = draft.trim()
    if (!text) return
    setPostError(null)
    try {
      await addComment(text)
      setDraft('')
    } catch (err) {
      setPostError(err instanceof Error ? err.message : 'Failed to post')
    }
  }

  return (
    <>
      <h3>Comments {!isLoading && `(${comments.length})`}</h3>
      {error && <p>Comments error: {error}</p>}
      <p>
        <input
          placeholder="Add a comment…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />{' '}
        <button type="button" onClick={post}>
          Post
        </button>
      </p>
      {postError && <p>{postError}</p>}
      {isLoading ? (
        <p>Loading comments…</p>
      ) : (
        <ul>
          {comments.map((comment) => (
            <li key={comment.id}>
              <strong>{comment.name || 'Anonymous'}</strong>{' '}
              ({formatRelativeDate(comment.date)}): {comment.text}
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

// Crude edit form proving the write path: local draft state, saved through
// useUpdateMovie (parameterized, changed-fields-only). This is the browser
// half of the two-way sync demo — the edit lands in the local store, syncs
// to the Big Peer, and the connector pushes it on to MongoDB Atlas.
function EditMovieForm({
  movie,
  onDone,
  onCancel,
}: {
  movie: Movie
  onDone: () => Promise<void>
  onCancel: () => void
}) {
  const { updateMovie } = useUpdateMovie()
  const [title, setTitle] = useState(movie.title)
  const [plot, setPlot] = useState(movie.plot)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const save = async () => {
    setIsSaving(true)
    setSaveError(null)
    try {
      await updateMovie(movie, { title, plot })
      await onDone()
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save')
      setIsSaving(false)
    }
  }

  return (
    <>
      <h2>Editing: {movie.title}</h2>
      <p>
        <label>
          Title{' '}
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
      </p>
      <p>
        <label>
          Plot{' '}
          <textarea
            value={plot}
            rows={4}
            cols={50}
            onChange={(e) => setPlot(e.target.value)}
          />
        </label>
      </p>
      {saveError && <p>Save error: {saveError}</p>}
      <button type="button" onClick={save} disabled={isSaving}>
        {isSaving ? 'Saving…' : 'Save'}
      </button>{' '}
      <button type="button" onClick={onCancel} disabled={isSaving}>
        Cancel
      </button>
    </>
  )
}

export default App
