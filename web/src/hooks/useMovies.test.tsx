// useMovies — the archetype observer hook. These tests interrogate its
// full lifecycle against the mocked provider: loading state, the exact
// projection query, raw-document -> MovieListing conversion, replace (not
// append) semantics on re-fire, cancel-on-unmount (our deliberate
// deviation from rn-expo's park-forever observer), and the isInitialized
// gate.
import type { ReactNode } from 'react'
import { renderHook, act } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DittoContext } from '../providers/DittoContext'
import { makeMockDittoService, type MockDitto } from '../test/mockDitto'
import { useMovies } from './useMovies'

// renderHook wrapper: the hook needs the provider, nothing else.
function wrapper(mock: MockDitto, isInitialized = true) {
  return ({ children }: { children: ReactNode }) => (
    <DittoContext.Provider
      value={{ dittoService: mock.service, isInitialized, error: null }}
    >
      {children}
    </DittoContext.Provider>
  )
}

const RAW_DOC = {
  _id: 'a1',
  title: 'Toy Story',
  plot: 'Toys come alive.',
  poster: 'https://example.com/ts.jpg',
  year: 1995, // number in mflix documents — model must stringify
}

describe('useMovies', () => {
  it('starts loading with no movies', () => {
    const mock = makeMockDittoService()
    const { result } = renderHook(() => useMovies(), {
      wrapper: wrapper(mock),
    })
    expect(result.current.isLoading).toBe(true)
    expect(result.current.movies).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('registers the card-projection observer query', () => {
    const mock = makeMockDittoService()
    renderHook(() => useMovies(), { wrapper: wrapper(mock) })
    expect(mock.lastObserver().query).toBe(
      'SELECT _id, plot, poster, title, year FROM movies ORDER BY year DESC'
    )
  })

  it('converts fired documents into MovieListing objects', () => {
    const mock = makeMockDittoService()
    const { result } = renderHook(() => useMovies(), {
      wrapper: wrapper(mock),
    })

    act(() => mock.lastObserver().fire([RAW_DOC]))

    expect(result.current.isLoading).toBe(false)
    expect(result.current.movies).toEqual([
      {
        id: 'a1', // _id -> id
        title: 'Toy Story',
        plot: 'Toys come alive.',
        poster: 'https://example.com/ts.jpg',
        year: '1995', // number -> string
      },
    ])
  })

  it('replaces (not appends) on subsequent observer firings', () => {
    const mock = makeMockDittoService()
    const { result } = renderHook(() => useMovies(), {
      wrapper: wrapper(mock),
    })

    act(() => mock.lastObserver().fire([RAW_DOC]))
    act(() =>
      mock
        .lastObserver()
        .fire([{ ...RAW_DOC, _id: 'b2', title: "A Bug's Life" }])
    )

    expect(result.current.movies).toHaveLength(1)
    expect(result.current.movies[0].id).toBe('b2')
    expect(result.current.movies[0].title).toBe("A Bug's Life")
  })

  it('cancels its observer on unmount (deviation from rn-expo, by design)', () => {
    const mock = makeMockDittoService()
    const { unmount } = renderHook(() => useMovies(), {
      wrapper: wrapper(mock),
    })
    const observer = mock.lastObserver()
    expect(observer.isCancelled).toBe(false)
    unmount()
    expect(observer.isCancelled).toBe(true)
  })

  it('registers nothing until Ditto is initialized', () => {
    const mock = makeMockDittoService()
    renderHook(() => useMovies(), { wrapper: wrapper(mock, false) })
    expect(mock.observers).toHaveLength(0)
  })
})
