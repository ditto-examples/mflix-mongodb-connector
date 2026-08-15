import { useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Heading,
  Image,
  Input,
  ProgressSpinner,
  TextArea,
} from '@dittolive/anvil'
import { useMovie } from '../hooks/useMovie'
import { useUpdateMovie } from '../hooks/useUpdateMovie'
import { useComments } from '../hooks/useComments'
import { formatRelativeDate } from '../models/comment'
import type { Movie } from '../models/movie'

// The detail/edit screen (route: /movies/:id): full movie record, inline
// edit form, and live comments.
export function MovieDetailScreen() {
  const { id } = useParams()
  const { movie, isLoading, error, refresh } = useMovie(id ?? '')
  const [isEditing, setIsEditing] = useState(false)

  if (error) return <EmptyState message={error} />
  if (isLoading || !movie) {
    return (
      <div className="flex justify-center py-24">
        <ProgressSpinner />
      </div>
    )
  }

  return isEditing ? (
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
    // Proportional at any size, no upper bound: the poster tracks ~28% of
    // the window width (floored at 11rem so it stays usable when narrow)
    // and the layout stacks in narrow/portrait windows.
    <div className="flex flex-col gap-8 md:flex-row">
      {movie.poster && (
        <Image
          src={movie.poster}
          alt={`Poster for ${movie.title}`}
          className="mx-auto h-fit w-[max(11rem,28vw)] shrink-0 rounded-xl shadow-lg md:mx-0"
        />
      )}
      {/* Fluid typography: font sizes track the viewport (floored at
          normal sizes), matching the poster's 28vw scaling — so the text
          block grows WITH the image and paragraphs keep the same line
          count at any window size. */}
      <div className="min-w-0 grow">
        <div className="flex flex-wrap items-center gap-3">
          {/* !leading-tight: anvil's h1 ships a FIXED 2rem line-height
              (sized for its default font size); once the font scales with
              the viewport, the line-height must be relative or big glyphs
              overflow the line box and overlap the row below. */}
          <Heading
            level={1}
            className="!mb-0 !text-[max(1.875rem,2.4vw)] !leading-tight"
          >
            {movie.title}
          </Heading>
          {movie.rated && <Badge colorScheme="brand">{movie.rated}</Badge>}
        </div>
        <p className="text-foreground-subtle mt-1 text-[max(0.875rem,1vw)]">
          {movie.year}
          {movie.runtime ? ` · ${movie.runtime} min` : ''}
          {movie.genres.length ? ` · ${movie.genres.join(', ')}` : ''}
        </p>
        <p className="mt-4 text-[max(1rem,1.25vw)] leading-relaxed">
          {movie.fullplot || movie.plot}
        </p>
        <dl className="text-foreground-subtle mt-4 text-[max(0.875rem,1vw)]">
          {movie.cast.length > 0 && (
            <div className="flex gap-2">
              <dt className="font-medium">Cast:</dt>
              <dd>{movie.cast.join(', ')}</dd>
            </div>
          )}
          {movie.directors.length > 0 && (
            <div className="flex gap-2">
              <dt className="font-medium">Directed by:</dt>
              <dd>{movie.directors.join(', ')}</dd>
            </div>
          )}
        </dl>
        <div className="mt-5">
          <Button
            type="button"
            variant="primary"
            onClick={() => setIsEditing(true)}
          >
            Edit
          </Button>
        </div>
        <CommentsSection movieId={movie.id} />
      </div>
    </div>
  )
}

// Edit form: anvil Input/TextArea (built-in labels + error rendering),
// saved through useUpdateMovie (parameterized, changed-fields-only). This
// is the browser half of the two-way sync demo — the edit lands in the
// local store, syncs to the Big Peer, and the connector pushes it on to
// MongoDB Atlas.
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
  const [fullplot, setFullplot] = useState(movie.fullplot)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const save = async () => {
    setIsSaving(true)
    setSaveError(null)
    try {
      await updateMovie(movie, { title, plot, fullplot })
      await onDone()
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save')
      setIsSaving(false)
    }
  }

  return (
    <Card className="mx-auto max-w-xl">
      <Card.Header>
        <Heading level={2} className="!mb-0">
          Editing: {movie.title}
        </Heading>
      </Card.Header>
      <Card.Body className="flex flex-col gap-4">
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <TextArea
          label="Plot (short summary)"
          rows={3}
          value={plot}
          onChange={(e) => setPlot(e.target.value)}
        />
        {/* The detail page displays fullplot when present — without this
            field, edits to the short plot save correctly but LOOK unsaved
            because the page keeps rendering the untouched fullplot. */}
        <TextArea
          label="Full plot (shown on this page when present)"
          rows={6}
          value={fullplot}
          onChange={(e) => setFullplot(e.target.value)}
          errorMessage={saveError ?? undefined}
        />
      </Card.Body>
      <Card.Footer className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
        <Button type="button" variant="primary" onClick={save} disabled={isSaving}>
          {isSaving ? 'Saving…' : 'Save'}
        </Button>
      </Card.Footer>
    </Card>
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
    <section className="mt-10">
      <Heading level={3}>
        Comments{!isLoading && ` (${comments.length})`}
      </Heading>
      {error && <EmptyState message={`Comments error: ${error}`} />}
      <div className="mb-4 flex items-end gap-2">
        <Input
          placeholder="Add a comment…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && post()}
          containerClassName="w-80"
          errorMessage={postError ?? undefined}
        />
        <Button type="button" onClick={post}>
          Post
        </Button>
      </div>
      {isLoading ? (
        <ProgressSpinner />
      ) : comments.length === 0 ? (
        <p className="text-foreground-subtle text-sm">
          No comments yet — be the first.
        </p>
      ) : (
        <Card isDivided>
          {comments.map((comment) => (
            <div key={comment.id} className="px-4 py-3">
              <p className="text-sm">
                <span className="font-medium">
                  {comment.name || 'Anonymous'}
                </span>{' '}
                <span className="text-foreground-subtle">
                  · {formatRelativeDate(comment.date)}
                </span>
              </p>
              <p className="mt-1">{comment.text}</p>
            </div>
          ))}
        </Card>
      )}
    </section>
  )
}
