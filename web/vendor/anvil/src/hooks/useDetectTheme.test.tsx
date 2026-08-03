import { act, render, screen } from '@testing-library/react'
import React from 'react'

import useDetectTheme from './useDetectTheme'

const TestComponent = () => {
  const theme = useDetectTheme()
  return <div data-testid="currentTheme">{theme}</div>
}

type MediaQueryListener = (e: MediaQueryListEvent) => void

const createMatchMediaMock = (matches: boolean) => {
  const listeners: MediaQueryListener[] = []

  const mql = {
    matches,
    media: '(prefers-color-scheme: dark)',
    addEventListener: jest.fn(
      (_event: string, listener: MediaQueryListener) => {
        listeners.push(listener)
      },
    ),
    removeEventListener: jest.fn(
      (_event: string, listener: MediaQueryListener) => {
        const index = listeners.indexOf(listener)
        if (index !== -1) listeners.splice(index, 1)
      },
    ),
    dispatchEvent: jest.fn(),
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    /** Fire a synthetic change event to all registered listeners. */
    _change(nextMatches: boolean) {
      mql.matches = nextMatches
      const event = { matches: nextMatches } as MediaQueryListEvent
      listeners.forEach((l) => l(event))
    },
  }

  return mql
}

describe('useDetectTheme', () => {
  let mql: ReturnType<typeof createMatchMediaMock>

  beforeEach(() => {
    mql = createMatchMediaMock(false)
    window.matchMedia = jest.fn().mockReturnValue(mql)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should return light when prefers-color-scheme is light', () => {
    mql = createMatchMediaMock(false)
    window.matchMedia = jest.fn().mockReturnValue(mql)

    render(<TestComponent />)

    expect(screen.getByTestId('currentTheme').innerHTML).toEqual('light')
  })

  it('should return dark when prefers-color-scheme is dark on mount', () => {
    mql = createMatchMediaMock(true)
    window.matchMedia = jest.fn().mockReturnValue(mql)

    render(<TestComponent />)

    expect(screen.getByTestId('currentTheme').innerHTML).toEqual('dark')
  })

  it('should update to dark when prefers-color-scheme changes to dark after mount', async () => {
    mql = createMatchMediaMock(false)
    window.matchMedia = jest.fn().mockReturnValue(mql)

    render(<TestComponent />)

    expect(screen.getByTestId('currentTheme').innerHTML).toEqual('light')

    await act(async () => {
      mql._change(true)
    })

    expect(screen.getByTestId('currentTheme').innerHTML).toEqual('dark')
  })

  it('should update to light when prefers-color-scheme changes to light after mount', async () => {
    mql = createMatchMediaMock(true)
    window.matchMedia = jest.fn().mockReturnValue(mql)

    render(<TestComponent />)

    expect(screen.getByTestId('currentTheme').innerHTML).toEqual('dark')

    await act(async () => {
      mql._change(false)
    })

    expect(screen.getByTestId('currentTheme').innerHTML).toEqual('light')
  })

  it('should remove the event listener when the component is unmounted', () => {
    mql = createMatchMediaMock(false)
    window.matchMedia = jest.fn().mockReturnValue(mql)

    const { unmount } = render(<TestComponent />)

    expect(mql.addEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function),
    )
    expect(mql.removeEventListener).not.toHaveBeenCalled()

    unmount()

    expect(mql.removeEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function),
    )
  })
})
