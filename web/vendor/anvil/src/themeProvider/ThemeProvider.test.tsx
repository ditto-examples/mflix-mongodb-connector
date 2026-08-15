import { act, fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

import { useThemeStore } from './store'
import { ThemeProvider, useTheme } from './ThemeProvider'
import { DEFAULT_THEME, THEME_STORAGE_KEY } from './types'

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
    _change(nextMatches: boolean) {
      mql.matches = nextMatches
      const event = { matches: nextMatches } as MediaQueryListEvent
      listeners.forEach((l) => l(event))
    },
  }
  return mql
}

const Probe = () => {
  const { theme, resolvedTheme, setTheme } = useTheme()
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="resolvedTheme">{resolvedTheme}</span>
      <button data-testid="set-light" onClick={() => setTheme('light')}>
        light
      </button>
      <button data-testid="set-dark" onClick={() => setTheme('dark')}>
        dark
      </button>
      <button data-testid="set-system" onClick={() => setTheme('system')}>
        system
      </button>
    </div>
  )
}

describe('ThemeProvider', () => {
  let mql: ReturnType<typeof createMatchMediaMock>

  beforeEach(() => {
    window.localStorage.clear()
    document.documentElement.className = ''
    delete document.documentElement.dataset.theme
    delete document.documentElement.dataset.appliedTheme
    mql = createMatchMediaMock(false)
    window.matchMedia = jest.fn().mockReturnValue(mql)
    // Reset the zustand store so state doesn't leak across tests.
    useThemeStore.setState({
      theme: DEFAULT_THEME,
      systemPrefersDark: false,
      resolvedTheme: 'light',
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('defaults to system theme resolved against the OS preference', () => {
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    )

    expect(screen.getByTestId('theme').textContent).toBe('system')
    expect(screen.getByTestId('resolvedTheme').textContent).toBe('light')
    expect(document.documentElement.dataset.appliedTheme).toBe('light')
    expect(document.documentElement.classList.contains('light')).toBe(true)
  })

  it('reflects the OS dark preference when the theme is system', () => {
    mql = createMatchMediaMock(true)
    window.matchMedia = jest.fn().mockReturnValue(mql)

    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    )

    expect(screen.getByTestId('resolvedTheme').textContent).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('persists the user choice in localStorage and applies it to the DOM', () => {
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    )

    fireEvent.click(screen.getByTestId('set-dark'))

    expect(screen.getByTestId('theme').textContent).toBe('dark')
    expect(screen.getByTestId('resolvedTheme').textContent).toBe('dark')
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.classList.contains('light')).toBe(false)
  })

  it('reacts to OS preference changes when the theme is system', () => {
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    )

    expect(screen.getByTestId('resolvedTheme').textContent).toBe('light')

    act(() => {
      mql._change(true)
    })

    expect(screen.getByTestId('resolvedTheme').textContent).toBe('dark')
  })

  it('reads the persisted theme from localStorage on mount', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'dark')
    // Trigger persist rehydration so the store picks up the seeded value.
    useThemeStore.persist.rehydrate()

    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    )

    expect(screen.getByTestId('theme').textContent).toBe('dark')
    expect(screen.getByTestId('resolvedTheme').textContent).toBe('dark')
  })
})
