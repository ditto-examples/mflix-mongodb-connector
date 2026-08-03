import { useEffect, useMemo, useState } from 'react'

/**
 * A hook that returns a boolean indicating whether the current window matches
 * the given media query.
 *
 * @see https://github.com/imbhargav5/rooks/blob/main/packages/rooks/src/hooks/useMediaMatch.ts
 */
export default function useMediaMatch(mediaQuery: string) {
  const matchMedia = useMemo<MediaQueryList>(
    () => window.matchMedia(mediaQuery),
    [mediaQuery],
  )
  const [matches, setMatches] = useState<boolean>(() => matchMedia.matches)

  useEffect(() => {
    setMatches(matchMedia.matches)
    const listener = (event: MediaQueryListEventMap['change']) =>
      setMatches(event.matches)

    if (matchMedia.addEventListener) {
      matchMedia.addEventListener('change', listener)
      return () => matchMedia.removeEventListener('change', listener)
    } else {
      matchMedia.addListener(listener)
      return () => matchMedia.removeListener(listener)
    }
  }, [matchMedia])

  // NOTE: This shouldn't happen since we don't do any SSR
  if (typeof window === 'undefined') {
    console.warn('useMediaMatch cannot function as window is undefined.')
    return false
  }

  return matches
}
