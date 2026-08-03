import * as React from 'react'
import { PropsWithChildren, useEffect } from 'react'

import { applyThemeToDocument, PREFERS_DARK_QUERY } from './resolve'
import { useThemeStore } from './store'
import { ResolvedTheme, Theme } from './types'

type ThemeContextValue = {
  /** The user's selected theme — may be `system`. */
  theme: Theme
  /** The actual theme applied to the DOM — never `system`. */
  resolvedTheme: ResolvedTheme
  /** Persist a new theme choice and apply it to the DOM. */
  setTheme: (next: Theme) => void
}

/**
 * Render once near the root of the app. Watches the OS-level dark-mode
 * preference and keeps the `<html>` element's `data-theme`,
 * `data-applied-theme`, and resolved-theme class in sync with the zustand
 * theme store as the user toggles or as the OS preference changes.
 *
 * For the FOUC prevention story to work, inject `themeFlashScript()` from
 * `@dittolive/anvil` into each app's `index.ejs` as early as possible in
 * `<head>` — that script applies the correct class before the React bundle
 * even loads.
 */
export const ThemeProvider = ({ children }: PropsWithChildren) => {
  const theme = useThemeStore((state) => state.theme)
  const resolvedTheme = useThemeStore((state) => state.resolvedTheme)
  const setSystemPrefersDark = useThemeStore(
    (state) => state.setSystemPrefersDark,
  )

  // Apply the resolved theme to the DOM. The FOUC script will already have
  // done this on first paint, so this mostly handles in-session toggles and
  // hydration.
  useEffect(() => {
    applyThemeToDocument(theme, resolvedTheme)
  }, [theme, resolvedTheme])

  // Track OS-level dark-mode preference so `system` reacts live.
  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      typeof window.matchMedia !== 'function'
    ) {
      return
    }
    const mql = window.matchMedia(PREFERS_DARK_QUERY)
    // Re-sync once on mount in case the preference changed before this effect
    // ran (e.g. between store init and component mount).
    setSystemPrefersDark(mql.matches)
    const handler = (event: MediaQueryListEvent) => {
      setSystemPrefersDark(event.matches)
    }
    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', handler)
      return () => mql.removeEventListener('change', handler)
    }
    // Safari < 14 fallback.
    mql.addListener(handler)
    return () => mql.removeListener(handler)
  }, [setSystemPrefersDark])

  return <>{children}</>
}

/**
 * Read and update the active theme. Backed by the zustand theme store, so it
 * works anywhere in the tree — there's no React context to consume. A
 * `<ThemeProvider />` should still be rendered once at the root so the DOM
 * stays in sync.
 */
export const useTheme = (): ThemeContextValue => {
  const theme = useThemeStore((state) => state.theme)
  const resolvedTheme = useThemeStore((state) => state.resolvedTheme)
  const setTheme = useThemeStore((state) => state.setTheme)
  return { theme, resolvedTheme, setTheme }
}
