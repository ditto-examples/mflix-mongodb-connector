// MovieListScreen — the browse + search screen through real user
// interaction: observer data becomes cards, typing runs a (debounced)
// search that swaps the grid to results, zero matches shows the
// EmptyState, and Clear restores browse mode.
import { screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { makeMockDittoService, renderWithDitto } from '../test/mockDitto'
import { MovieListScreen } from './MovieListScreen'

const DOC = (id: string, title: string) => ({
  _id: id,
  title,
  plot: 'plot',
  poster: '',
  year: 2000,
})

describe('MovieListScreen', () => {
  it('shows cards once the movies observer delivers', async () => {
    const mock = makeMockDittoService()
    renderWithDitto(<MovieListScreen />, { mock })

    // Before data: loading, no cards.
    expect(screen.queryByText('Toy Story')).not.toBeInTheDocument()

    act(() =>
      mock.observers[0].fire([DOC('a1', 'Toy Story'), DOC('b2', 'Cars')])
    )

    expect(screen.getByText('Toy Story')).toBeInTheDocument()
    expect(screen.getByText('Cars')).toBeInTheDocument()
    expect(screen.getByText(/2 movies synced/)).toBeInTheDocument()
  })

  it('typing searches (debounced) and swaps the grid to results', async () => {
    const user = userEvent.setup()
    const mock = makeMockDittoService({
      onExecute: (query) =>
        query.includes('LIKE') ? [DOC('s1', 'Toy Story')] : [],
    })
    renderWithDitto(<MovieListScreen />, { mock })
    act(() => mock.observers[0].fire([DOC('a1', 'Browse Movie')]))

    await user.type(screen.getByPlaceholderText('Search titles…'), 'toy')

    // Debounce (200ms) then results replace the browse grid.
    expect(await screen.findByText(/1 matches/)).toBeInTheDocument()
    expect(screen.getByText('Toy Story')).toBeInTheDocument()
    expect(screen.queryByText('Browse Movie')).not.toBeInTheDocument()
    expect(mock.execute.mock.calls[0][1]).toEqual({ searchTerm: '%toy%' })
  })

  it('shows the EmptyState when a search matches nothing', async () => {
    const user = userEvent.setup()
    const mock = makeMockDittoService({ onExecute: () => [] })
    renderWithDitto(<MovieListScreen />, { mock })
    act(() => mock.observers[0].fire([DOC('a1', 'Browse Movie')]))

    await user.type(screen.getByPlaceholderText('Search titles…'), 'zzz')

    expect(
      await screen.findByText(/No titles match/)
    ).toBeInTheDocument()
  })

  it('Clear restores browse mode', async () => {
    const user = userEvent.setup()
    const mock = makeMockDittoService({ onExecute: () => [] })
    renderWithDitto(<MovieListScreen />, { mock })
    act(() => mock.observers[0].fire([DOC('a1', 'Browse Movie')]))

    await user.type(screen.getByPlaceholderText('Search titles…'), 'zzz')
    await screen.findByText(/No titles match/)

    await user.click(screen.getByRole('button', { name: 'Clear' }))

    expect(screen.getByText('Browse Movie')).toBeInTheDocument()
    expect(screen.queryByText(/No titles match/)).not.toBeInTheDocument()
  })
})
