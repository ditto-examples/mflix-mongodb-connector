import { useCallback } from 'react'
import { useDitto } from '../providers/DittoContext'
import type { Movie } from '../models/movie'

// Write hook: INSERT a new movie. Faithful port of rn-expo's useAddMovie
// (it was already provider-routed) with one 5.1 change: mutatedDocumentIDs()
// no longer exists — only mutatedDocumentIDsV2() ships in the web bundle.
export function useAddMovie() {
  const { dittoService } = useDitto()

  const addMovie = useCallback(
    async (movieData: Partial<Movie>) => {
      // Same defaults as rn-expo: new movies are rated 'G' (keeps them
      // inside the app's own G/PG subscription so they sync + show up),
      // zeroed imdb ratings, empty arrays for the rest.
      const newMovie = {
        title: movieData.title ?? '',
        year: movieData.year ?? '',
        plot: movieData.plot ?? '',
        poster: movieData.poster ?? '',
        fullplot: movieData.fullplot ?? '',
        countries: movieData.countries ?? [],
        rated: 'G',
        genres: movieData.genres ?? [],
        directors: movieData.directors ?? [],
        languages: movieData.languages ?? [],
        imdb: { rating: 0, votes: 0 },
      }

      const result = await dittoService
        .getDitto()
        .store.execute('INSERT INTO movies DOCUMENTS (:newMovie)', { newMovie })

      if (result.mutatedDocumentIDsV2().length === 0) {
        throw new Error('Failed to add movie')
      }
      return result
    },
    [dittoService]
  )

  return { addMovie }
}
