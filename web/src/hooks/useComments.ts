import { useCallback, useEffect, useState } from 'react'
import { useDitto } from '../providers/DittoContext'
import { commentFromJson, type Comment } from '../models/comment'

// Real-time comments for one movie: an observer bound to :movieId. This is
// the observer-per-parameter pattern — when movieId changes, the effect
// re-runs: cleanup cancels the old observer, the body registers a new one.
//
// Ported from rn-expo's useComments (the best-written hook there, though no
// screen used it — movieDetails used one-shot useCommentsQuery instead, so
// remote comments never appeared without a manual refresh; we port the live
// version and skip useCommentsQuery entirely). Changes vs the original:
// routed through useDitto() instead of DittoService.getInstance(); the stray
// `await` on registerObserver dropped (it's synchronous in 5.1); observer
// lifecycle handled entirely by the effect instead of a ref + manual cancel;
// and no refresh() — with a live observer there is nothing to refresh.
export function useComments(movieId: string | undefined) {
  const { dittoService, isInitialized } = useDitto()
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isInitialized) return
    if (!movieId) {
      setComments([])
      setIsLoading(false)
      return
    }

    // Reset for the new movie: without this, navigating from movie A's
    // detail straight to movie B's would keep rendering A's comments until
    // B's observer first fires (regression vs rn-expo, which re-set
    // isLoading on every re-fetch).
    setComments([])
    setIsLoading(true)
    setError(null)

    try {
      const observer = dittoService.getDitto().store.registerObserver(
        'SELECT * FROM comments WHERE movie_id = :movieId ORDER BY date DESC',
        (result) => {
          setComments(result.items.map((item) => commentFromJson(item.value)))
          setIsLoading(false)
        },
        { movieId }
      )
      return () => observer.cancel()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch comments')
      setIsLoading(false)
    }
  }, [dittoService, isInitialized, movieId])

  const addComment = useCallback(
    async (text: string) => {
      if (!movieId) throw new Error('Movie ID is required')

      // Same shape as rn-expo's insert: anonymous author, ISO date.
      const newComment = {
        name: 'Anonymous',
        email: '',
        movie_id: movieId,
        text,
        date: new Date().toISOString(),
      }
      await dittoService
        .getDitto()
        .store.execute('INSERT INTO comments DOCUMENTS (:newComment)', {
          newComment,
        })
      // No manual re-fetch: the insert changes the local store, so the
      // observer above fires on its own — for OUR insert and for anyone
      // else's arriving via sync. That symmetry is the whole point.
    },
    [dittoService, movieId]
  )

  return { comments, isLoading, error, addComment }
}
