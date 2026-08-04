// Data-layer integration tests (Aaron's second ask): the app's REAL DQL
// statements and model converters against a REAL Ditto engine — offline
// smallPeersOnly mode, no mocks, no network. What mocks can't prove:
// that our query strings parse, that the engine honors parameterization,
// that lower() exists, that observers actually fire on local writes.
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createRequire } from 'node:module'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { Ditto, DittoConfig, init } from '@dittolive/ditto'
import { movieFromJson } from '../../models/movie'
import { commentFromJson } from '../../models/comment'

const require = createRequire(import.meta.url)

let ditto: Ditto
// Isolated persistence per run (see ditto.integration.test.ts for why).
const persistenceDir = mkdtempSync(join(tmpdir(), 'ditto-data-test-'))

beforeAll(async () => {
  const wasm = readFileSync(require.resolve('@dittolive/ditto/web/ditto.wasm'))
  await init({ webAssemblyModule: wasm })
  ditto = await Ditto.open(
    new DittoConfig(
      'data-layer-test',
      { mode: 'smallPeersOnly' },
      persistenceDir
    )
  )
}, 30_000)

afterAll(async () => {
  await ditto?.close()
  rmSync(persistenceDir, { recursive: true, force: true })
})

describe('data layer against the real engine', () => {
  it('useAddMovie shape: INSERT with defaults, read back via useMovie query', async () => {
    // Same document shape useAddMovie builds (rated G, zeroed imdb).
    const newMovie = {
      _id: 'test-m1',
      title: 'Integration Test Movie',
      year: '2026',
      plot: 'A test.',
      poster: '',
      fullplot: '',
      countries: ['USA'],
      rated: 'G',
      genres: [],
      directors: [],
      languages: [],
      imdb: { rating: 0, votes: 0 },
    }
    const insert = await ditto.store.execute(
      'INSERT INTO movies DOCUMENTS (:newMovie)',
      { newMovie }
    )
    expect(insert.mutatedDocumentIDsV2()).toHaveLength(1)

    // useMovie's exact query + model conversion.
    const result = await ditto.store.execute(
      'SELECT * FROM movies WHERE _id = :movieId',
      { movieId: 'test-m1' }
    )
    expect(result.items).toHaveLength(1)
    const movie = movieFromJson(result.items[0].value)
    expect(movie.title).toBe('Integration Test Movie')
    expect(movie.rated).toBe('G')
    expect(movie.year).toBe('2026')
  })

  it("useUpdateMovie shape: parameterized UPDATE survives apostrophes", async () => {
    await ditto.store.execute(
      "UPDATE movies SET title = :title WHERE _id = :id",
      { id: 'test-m1', title: "Ocean's Integration Test" }
    )
    const result = await ditto.store.execute(
      'SELECT title FROM movies WHERE _id = :movieId',
      { movieId: 'test-m1' }
    )
    expect(result.items[0].value.title).toBe("Ocean's Integration Test")
  })

  it('useMovieSearch shape: lower(title) LIKE works in this engine', async () => {
    const result = await ditto.store.execute(
      `SELECT _id, plot, poster, title, year
        FROM movies
        WHERE lower(title) LIKE :searchTerm AND (rated = 'G' OR rated = 'PG')
        ORDER BY year DESC`,
      { searchTerm: "%ocean's%" }
    )
    expect(result.items).toHaveLength(1)
    expect(result.items[0].value._id).toBe('test-m1')
  })

  it('useComments shape: the observer fires when a comment is inserted', async () => {
    const seen: number[] = []
    let resolveTwo: () => void
    const sawTwoFirings = new Promise<void>((resolve) => {
      resolveTwo = resolve
    })

    const observer = ditto.store.registerObserver(
      'SELECT * FROM comments WHERE movie_id = :movieId ORDER BY date DESC',
      (result) => {
        seen.push(result.items.length)
        if (seen.length >= 2) resolveTwo()
      },
      { movieId: 'test-m1' }
    )

    // useComments' insert shape.
    await ditto.store.execute('INSERT INTO comments DOCUMENTS (:newComment)', {
      newComment: {
        _id: 'test-c1',
        name: 'Anonymous',
        email: '',
        movie_id: 'test-m1',
        text: 'Observer, did you see this?',
        date: new Date().toISOString(),
      },
    })

    await sawTwoFirings // initial (empty) firing + post-insert firing
    expect(seen[0]).toBe(0)
    expect(seen[seen.length - 1]).toBe(1)

    const readBack = await ditto.store.execute(
      'SELECT * FROM comments WHERE movie_id = :movieId ORDER BY date DESC',
      { movieId: 'test-m1' }
    )
    const comment = commentFromJson(readBack.items[0].value)
    expect(comment.text).toBe('Observer, did you see this?')
    expect(comment.movieId).toBe('test-m1')

    observer.cancel()
    expect(observer.isCancelled).toBe(true)
  })
})
