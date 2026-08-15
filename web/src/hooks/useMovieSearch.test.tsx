// useMovieSearch — the debounced one-shot search hook. Fake timers let the
// tests own the clock: prove queries wait out the 200ms debounce, rapid
// typing coalesces to ONE query, the search term is lowercased for the
// case-insensitive lower(title) LIKE match, errors surface, and clearing
// resets everything.
import { renderHook, act } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { hookWrapper, makeMockDittoService } from '../test/mockDitto'
import { useMovieSearch } from './useMovieSearch'

const RAW_DOC = {
  _id: 'a1',
  title: 'Toy Story',
  plot: 'Toys come alive.',
  poster: '',
  year: 1995,
}

describe('useMovieSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('debounces: no query until 200ms after the last keystroke', async () => {
    const mock = makeMockDittoService({ onExecute: () => [RAW_DOC] })
    const { result } = renderHook(() => useMovieSearch(), {
      wrapper: hookWrapper(mock),
    })

    act(() => result.current.setSearchQuery('Toy'))
    await act(() => vi.advanceTimersByTimeAsync(199))
    expect(mock.execute).not.toHaveBeenCalled()

    await act(() => vi.advanceTimersByTimeAsync(1))
    expect(mock.execute).toHaveBeenCalledTimes(1)
  })

  it('lowercases the bound search term (case-insensitive match)', async () => {
    const mock = makeMockDittoService({ onExecute: () => [] })
    const { result } = renderHook(() => useMovieSearch(), {
      wrapper: hookWrapper(mock),
    })

    act(() => result.current.setSearchQuery('  ToY StOrY '))
    await act(() => vi.advanceTimersByTimeAsync(200))

    const [query, args] = mock.execute.mock.calls[0]
    expect(query).toContain('lower(title) LIKE :searchTerm')
    expect(args).toEqual({ searchTerm: '%toy story%' })
  })

  it('coalesces rapid typing into a single query for the final text', async () => {
    const mock = makeMockDittoService({ onExecute: () => [] })
    const { result } = renderHook(() => useMovieSearch(), {
      wrapper: hookWrapper(mock),
    })

    act(() => result.current.setSearchQuery('t'))
    await act(() => vi.advanceTimersByTimeAsync(100))
    act(() => result.current.setSearchQuery('to'))
    await act(() => vi.advanceTimersByTimeAsync(100))
    act(() => result.current.setSearchQuery('toy'))
    await act(() => vi.advanceTimersByTimeAsync(200))

    expect(mock.execute).toHaveBeenCalledTimes(1)
    expect(mock.execute.mock.calls[0][1]).toEqual({ searchTerm: '%toy%' })
  })

  it('delivers converted results and clears the searching flag', async () => {
    const mock = makeMockDittoService({ onExecute: () => [RAW_DOC] })
    const { result } = renderHook(() => useMovieSearch(), {
      wrapper: hookWrapper(mock),
    })

    act(() => result.current.setSearchQuery('toy'))
    expect(result.current.isSearching).toBe(true)
    await act(() => vi.advanceTimersByTimeAsync(200))

    expect(result.current.isSearching).toBe(false)
    expect(result.current.searchResults).toEqual([
      { id: 'a1', title: 'Toy Story', plot: 'Toys come alive.', poster: '', year: '1995' },
    ])
  })

  it('surfaces query errors in searchError', async () => {
    const mock = makeMockDittoService({
      onExecute: () => {
        throw new Error('bad DQL')
      },
    })
    const { result } = renderHook(() => useMovieSearch(), {
      wrapper: hookWrapper(mock),
    })

    act(() => result.current.setSearchQuery('toy'))
    await act(() => vi.advanceTimersByTimeAsync(200))

    expect(result.current.searchError).toBe('bad DQL')
    expect(result.current.searchResults).toEqual([])
    expect(result.current.isSearching).toBe(false)
  })

  it('clearSearch resets query, results, and errors', async () => {
    const mock = makeMockDittoService({ onExecute: () => [RAW_DOC] })
    const { result } = renderHook(() => useMovieSearch(), {
      wrapper: hookWrapper(mock),
    })

    act(() => result.current.setSearchQuery('toy'))
    await act(() => vi.advanceTimersByTimeAsync(200))
    expect(result.current.searchResults).toHaveLength(1)

    act(() => result.current.clearSearch())
    expect(result.current.searchQuery).toBe('')
    expect(result.current.searchResults).toEqual([])
    expect(result.current.searchError).toBeNull()
  })
})
