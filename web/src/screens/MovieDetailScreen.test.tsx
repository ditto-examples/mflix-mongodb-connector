// MovieDetailScreen — detail, edit, and live comments through the mocked
// provider. Notable branches: the "Movie not found" path (unreachable in
// rn-expo — its items !== null check crashed instead; our items.length
// fix makes it real), the edit-save-refresh loop, and comments arriving
// through the observer with no refresh logic.
import { Route, Routes } from 'react-router-dom'
import { screen, act, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { makeMockDittoService, renderWithDitto, type MockDitto } from '../test/mockDitto'
import { MovieDetailScreen } from './MovieDetailScreen'

const MOVIE_DOC = {
  _id: 'm1',
  title: 'Toy Story',
  plot: 'Short plot.',
  fullplot: 'The long, full plot of Toy Story.',
  poster: 'https://example.com/p.jpg',
  rated: 'G',
  year: 1995,
  runtime: 81,
  genres: ['Animation'],
  cast: ['Tom Hanks'],
  directors: ['John Lasseter'],
  countries: ['USA'],
}

const COMMENT_DOC = {
  _id: 'c1',
  name: 'Yara',
  email: '',
  movie_id: 'm1',
  text: 'A classic.',
  date: new Date().toISOString(),
}

// The screen reads :id from the route, so mount it behind a real Route.
function renderDetail(mock: MockDitto, id = 'm1') {
  return renderWithDitto(
    <Routes>
      <Route path="/movies/:id" element={<MovieDetailScreen />} />
    </Routes>,
    { mock, route: `/movies/${id}` }
  )
}

describe('MovieDetailScreen', () => {
  it('renders the full movie record', async () => {
    const mock = makeMockDittoService({
      onExecute: (q) => (q.includes('FROM movies') ? [MOVIE_DOC] : []),
    })
    renderDetail(mock)

    expect(
      await screen.findByRole('heading', { name: 'Toy Story' })
    ).toBeInTheDocument()
    expect(screen.getByText('G')).toBeInTheDocument() // rating badge
    expect(
      screen.getByText('The long, full plot of Toy Story.')
    ).toBeInTheDocument() // fullplot preferred over plot
    expect(screen.getByText(/Tom Hanks/)).toBeInTheDocument()
    // The movie query bound the route id as a parameter.
    expect(mock.execute.mock.calls[0][1]).toEqual({ movieId: 'm1' })
  })

  it('shows "Movie not found" for a missing id (the items.length fix)', async () => {
    const mock = makeMockDittoService({ onExecute: () => [] })
    renderDetail(mock, 'nope')

    expect(await screen.findByText('Movie not found')).toBeInTheDocument()
  })

  it('renders live comments and posts new ones through the observer', async () => {
    const user = userEvent.setup()
    const mock = makeMockDittoService({
      onExecute: (q) => (q.includes('FROM movies') ? [MOVIE_DOC] : []),
      mutatedIds: (q) => (q.includes('INSERT') ? ['c2'] : []),
    })
    renderDetail(mock)
    await screen.findByRole('heading', { name: 'Toy Story' })

    // The comments observer is bound to this movie's id.
    const commentsObserver = mock.lastObserver()
    expect(commentsObserver.query).toContain('FROM comments')
    expect(commentsObserver.args).toEqual({ movieId: 'm1' })

    act(() => commentsObserver.fire([COMMENT_DOC]))
    expect(screen.getByText(/A classic\./)).toBeInTheDocument()
    expect(screen.getByText(/Comments \(1\)/)).toBeInTheDocument()

    // Post: fires an INSERT with the draft text; UI updates when the
    // observer re-fires (as sync would make it) — no refresh logic.
    await user.type(screen.getByPlaceholderText('Add a comment…'), 'Loved it')
    await user.click(screen.getByRole('button', { name: 'Post' }))

    const insertCall = mock.execute.mock.calls.find(([q]) =>
      q.includes('INSERT INTO comments')
    )
    expect(insertCall).toBeDefined()
    const inserted = (insertCall![1] as { newComment: Record<string, unknown> })
      .newComment
    expect(inserted.text).toBe('Loved it')
    expect(inserted.movie_id).toBe('m1')

    act(() =>
      commentsObserver.fire([
        COMMENT_DOC,
        { ...COMMENT_DOC, _id: 'c2', text: 'Loved it', name: 'Anonymous' },
      ])
    )
    expect(screen.getByText(/Loved it/)).toBeInTheDocument()
    expect(screen.getByText(/Comments \(2\)/)).toBeInTheDocument()
  })

  it('saves edits through the parameterized update and refreshes', async () => {
    const user = userEvent.setup()
    let title = 'Toy Story'
    const mock = makeMockDittoService({
      onExecute: (q) =>
        q.includes('FROM movies') ? [{ ...MOVIE_DOC, title }] : [],
      mutatedIds: (q) => (q.includes('UPDATE') ? ['m1'] : []),
    })
    renderDetail(mock)
    await screen.findByRole('heading', { name: 'Toy Story' })

    await user.click(screen.getByRole('button', { name: 'Edit' }))
    // getByDisplayValue, not getByLabelText: anvil's Input doesn't
    // associate its label with the control (no for/id — upstream a11y
    // gap, reported alongside the classnames/Inter findings).
    const titleInput = screen.getByDisplayValue('Toy Story')
    await user.clear(titleInput)
    await user.type(titleInput, 'Toy Story (Extended)')
    title = 'Toy Story (Extended)' // what the post-save refresh will read

    await user.click(screen.getByRole('button', { name: 'Save' }))

    // Parameterized update went out…
    const updateCall = mock.execute.mock.calls.find(([q]) =>
      q.includes('UPDATE movies')
    )
    expect(updateCall![0]).toContain('title = :title')
    expect(updateCall![0]).not.toContain('Extended') // value not in query text
    // …and the refreshed detail view shows the new title.
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: 'Toy Story (Extended)' })
      ).toBeInTheDocument()
    )
  })
})
