// useUpdateMovie — the parameterized-UPDATE hook. The headline test is the
// apostrophe: rn-expo's original built `title = '${value}'` by string
// interpolation, which breaks on "Ocean's Eleven" (PORT_SPEC bug #1). Ours
// must send values ONLY as bound :parameters — never inside the query
// text. Also covered: changed-fields-only diffing, the no-op path, and the
// zero-mutations error.
import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { hookWrapper, makeMockDittoService } from '../test/mockDitto'
import { movieFromJson, type Movie } from '../models/movie'
import { useUpdateMovie } from './useUpdateMovie'

const BASE: Movie = movieFromJson({
  _id: 'm1',
  title: 'Old Title',
  plot: 'Old plot.',
  poster: 'https://example.com/p.jpg',
  fullplot: 'Old full plot.',
  countries: ['USA'],
  year: 1999,
})

describe('useUpdateMovie', () => {
  it("binds values as parameters — the Ocean's Eleven test", async () => {
    const mock = makeMockDittoService({ mutatedIds: () => ['m1'] })
    const { result } = renderHook(() => useUpdateMovie(), {
      wrapper: hookWrapper(mock),
    })

    await result.current.updateMovie(BASE, { title: "Ocean's Eleven" })

    const [query, args] = mock.execute.mock.calls[0]
    // The value must travel in args, never in the query text.
    expect(query).toBe('UPDATE movies SET title = :title WHERE _id = :id')
    expect(query).not.toContain('Ocean')
    expect(args).toEqual({ id: 'm1', title: "Ocean's Eleven" })
  })

  it('writes only fields that actually changed', async () => {
    const mock = makeMockDittoService({ mutatedIds: () => ['m1'] })
    const { result } = renderHook(() => useUpdateMovie(), {
      wrapper: hookWrapper(mock),
    })

    await result.current.updateMovie(BASE, {
      title: 'Old Title', // unchanged — must not appear
      plot: 'New plot.', // changed
      fullplot: 'Old full plot.', // unchanged — must not appear
    })

    const [query, args] = mock.execute.mock.calls[0]
    expect(query).toBe('UPDATE movies SET plot = :plot WHERE _id = :id')
    expect(args).toEqual({ id: 'm1', plot: 'New plot.' })
  })

  it('is a no-op when nothing changed (no query at all)', async () => {
    const mock = makeMockDittoService()
    const { result } = renderHook(() => useUpdateMovie(), {
      wrapper: hookWrapper(mock),
    })

    const outcome = await result.current.updateMovie(BASE, {
      title: 'Old Title',
      countries: ['USA'], // deep-equal — unchanged
    })

    expect(outcome).toBeUndefined()
    expect(mock.execute).not.toHaveBeenCalled()
  })

  it('throws when the update mutated zero documents', async () => {
    const mock = makeMockDittoService({ mutatedIds: () => [] })
    const { result } = renderHook(() => useUpdateMovie(), {
      wrapper: hookWrapper(mock),
    })

    await expect(
      result.current.updateMovie(BASE, { title: 'New' })
    ).rejects.toThrow('No documents were updated')
  })
})
