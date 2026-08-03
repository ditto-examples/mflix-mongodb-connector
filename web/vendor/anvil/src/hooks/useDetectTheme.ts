import { useEffect, useState } from 'react'

type ThemeType = 'light' | 'dark'

const PREFERS_DARK_QUERY = '(prefers-color-scheme: dark)'

const getMediaQuery = (): MediaQueryList | null => {
  if (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function'
  ) {
    return window.matchMedia(PREFERS_DARK_QUERY)
  }
  return null
}

/**
 * Read the applied theme from `<html>`'s dataset/class. Returns null when the
 * page has not been tagged yet (for example, before the FOUC script runs in
 * tests), letting the caller fall back to the media query.
 */
const getAppliedThemeFromDocument = (): ThemeType | null => {
  if (typeof document === 'undefined') return null
  const root = document.documentElement
  const applied = root.dataset.appliedTheme
  if (applied === 'dark' || applied === 'light') return applied
  if (root.classList.contains('dark')) return 'dark'
  if (root.classList.contains('light')) return 'light'
  return null
}

const getTheme = (): ThemeType => {
  const fromDocument = getAppliedThemeFromDocument()
  if (fromDocument) return fromDocument
  return getMediaQuery()?.matches ? 'dark' : 'light'
}

/**
 * Detect the current active theme. Prefers the value applied to the `<html>`
 * element by `ThemeProvider` (so manual user selections win), and falls back
 * to the OS-level `prefers-color-scheme` media query when the document hasn't
 * been tagged yet.
 */
const useDetectTheme = (): ThemeType => {
  const [theme, setTheme] = useState<ThemeType>(getTheme)

  // Keep the value in sync with the OS-level preference. `ThemeProvider` will
  // update the document attributes when the resolved theme changes, which we
  // observe via the MutationObserver below.
  useEffect(() => {
    const mediaQuery = getMediaQuery()
    if (!mediaQuery) return

    const handler = () => setTheme(getTheme())

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    } else if (typeof mediaQuery.addListener === 'function') {
      // Fallback for older browsers that don't support addEventListener on MediaQueryList
      mediaQuery.addListener(handler)
      return () => mediaQuery.removeListener(handler)
    }
  }, [])

  // Observe class/dataset changes on `<html>` so manual theme toggles via
  // `ThemeProvider` propagate to all consumers of this hook.
  useEffect(() => {
    if (
      typeof document === 'undefined' ||
      typeof MutationObserver !== 'function'
    )
      return
    const root = document.documentElement
    const observer = new MutationObserver(() => setTheme(getTheme()))
    observer.observe(root, {
      attributes: true,
      attributeFilter: ['class', 'data-applied-theme', 'data-theme'],
    })
    // Re-sync once on mount in case the document was tagged after first render.
    setTheme(getTheme())
    return () => observer.disconnect()
  }, [])

  return theme
}

export default useDetectTheme
