import { useCallback } from 'react'
import { useDitto } from '../providers/DittoContext'
import type { Movie } from '../models/movie'

// The fields the edit flow may change. The SET clause is assembled from THIS
// list only — never from user input — so the dynamic query text is safe;
// every VALUE travels as a bound :parameter.
const EDITABLE_FIELDS = [
  'title',
  'year',
  'plot',
  'poster',
  'fullplot',
  'countries',
] as const

// Write hook: partial UPDATE of one movie — only fields that actually
// changed are written (same diffing behavior as rn-expo).
//
// Rewritten vs rn-expo (PORT_SPEC bug #1): the original interpolated values
// into the query string — `title = '${updates.title}'` — which breaks on any
// apostrophe ("Ocean's Eleven") and is the injection anti-pattern the other
// hooks correctly avoid. Here values bind as parameters. Also 5.1's
// mutatedDocumentIDsV2() rename.
export function useUpdateMovie() {
  const { dittoService } = useDitto()

  const updateMovie = useCallback(
    async (movie: Movie, updates: Partial<Movie>) => {
      const setClauses: string[] = []
      const args: Record<string, string | string[]> = { id: movie.id }

      for (const field of EDITABLE_FIELDS) {
        const next = updates[field]
        if (next === undefined) continue
        const changed =
          field === 'countries'
            ? JSON.stringify(next) !== JSON.stringify(movie.countries)
            : next !== movie[field]
        if (changed) {
          setClauses.push(`${field} = :${field}`)
          args[field] = next
        }
      }

      // Nothing actually changed: succeed as a no-op, like the original.
      if (setClauses.length === 0) return

      const result = await dittoService
        .getDitto()
        .store.execute(
          `UPDATE movies SET ${setClauses.join(', ')} WHERE _id = :id`,
          args
        )

      if (result.mutatedDocumentIDsV2().length === 0) {
        throw new Error('No documents were updated')
      }
      return result
    },
    [dittoService]
  )

  return { updateMovie }
}
