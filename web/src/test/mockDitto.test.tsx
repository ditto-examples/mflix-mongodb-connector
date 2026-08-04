// Harness verification: a probe component exercises both fake-store
// dialects (execute + observer) through the real useDitto() seam, proving
// the mock behaves like the code expects before any real suite relies on
// it.
import { useEffect, useState } from 'react'
import { act, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useDitto } from '../providers/DittoContext'
import { makeMockDittoService, renderWithDitto } from './mockDitto'

function Probe() {
  const { dittoService, isInitialized } = useDitto()
  const [rows, setRows] = useState<string[]>([])
  const [executed, setExecuted] = useState<string | null>(null)

  useEffect(() => {
    if (!isInitialized) return
    const observer = dittoService
      .getDitto()
      .store.registerObserver('SELECT probe', (result) =>
        setRows(result.items.map((i) => String(i.value)))
      )
    dittoService
      .getDitto()
      .store.execute('SELECT one', { a: 1 })
      .then((r) => setExecuted(String(r.items[0]?.value ?? 'empty')))
    return () => observer.cancel()
  }, [dittoService, isInitialized])

  return (
    <>
      <p>executed: {executed ?? 'pending'}</p>
      <ul>
        {rows.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
    </>
  )
}

describe('mockDitto harness', () => {
  it('resolves execute with canned rows', async () => {
    const mock = makeMockDittoService({ onExecute: () => ['result-row'] })
    renderWithDitto(<Probe />, { mock })
    expect(await screen.findByText('executed: result-row')).toBeInTheDocument()
    expect(mock.execute).toHaveBeenCalledWith('SELECT one', { a: 1 })
  })

  it('delivers observer results when the test fires them', async () => {
    const mock = makeMockDittoService()
    renderWithDitto(<Probe />, { mock })
    expect(mock.lastObserver().query).toBe('SELECT probe')

    act(() => mock.lastObserver().fire(['alpha', 'beta']))
    expect(screen.getByText('alpha')).toBeInTheDocument()
    expect(screen.getByText('beta')).toBeInTheDocument()
  })

  it('cancels the observer on unmount', () => {
    const mock = makeMockDittoService()
    const { unmount } = renderWithDitto(<Probe />, { mock })
    const observer = mock.lastObserver()
    expect(observer.isCancelled).toBe(false)
    unmount()
    expect(observer.isCancelled).toBe(true)
  })

  it('gates on isInitialized', () => {
    const mock = makeMockDittoService()
    renderWithDitto(<Probe />, { mock, isInitialized: false })
    expect(mock.observers).toHaveLength(0)
    expect(mock.execute).not.toHaveBeenCalled()
  })
})
