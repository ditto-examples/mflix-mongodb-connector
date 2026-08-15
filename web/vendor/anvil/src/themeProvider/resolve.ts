import { RESOLVED_THEMES, ResolvedTheme, Theme } from './types'

const PREFERS_DARK_QUERY = '(prefers-color-scheme: dark)'

/** Read the user's OS-level dark-mode preference. */
export const prefersDark = (): boolean => {
  if (
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function'
  ) {
    return false
  }
  return window.matchMedia(PREFERS_DARK_QUERY).matches
}

/** Resolve a `Theme` (which may be `system`) to a concrete `ResolvedTheme`. */
export const resolveTheme = (
  theme: Theme,
  systemPrefersDark = prefersDark(),
): ResolvedTheme => {
  if (theme === 'system') return systemPrefersDark ? 'dark' : 'light'
  return theme
}

/**
 * Tailwind v4 utilities applied to `<html>` to short-circuit transitions on
 * every element during a theme swap. The `**:` variant targets all
 * descendants; the trailing `!` makes the rule beat any colliding
 * `transition-*` utilities elsewhere in the cascade.
 *
 * `transition-none!` resolves to `transition-property: none !important`, which
 * disables **all** CSS transitions for the suppression window — not only
 * color-related ones — and also interrupts any transitions that happened to
 * be in flight. We accept that trade-off because the window only spans two
 * animation frames, color transitions are the only ones that visibly cascade
 * during a theme swap, and narrowing the override to color properties via
 * CSS would still interrupt non-color in-flight transitions (any change to
 * `transition-property` cancels transitions on properties dropped from the
 * new list).
 *
 * The literal strings must stay in source so Tailwind's content scanner
 * generates the corresponding CSS — the components package is `@source`d by
 * every app, so this is picked up automatically.
 */
const TRANSITION_SUPPRESS_CLASSES = [
  'transition-none!',
  '**:transition-none!',
] as const

/**
 * Monotonically increasing token identifying the most recent suppression
 * request. A pending cleanup only restores transitions if its token still
 * matches — rapid successive swaps therefore extend the suppression window
 * instead of stomping on each other.
 */
let suppressionToken = 0

/**
 * Briefly disable CSS transitions across the document so a theme swap doesn't
 * trigger a cascade of visible color animations.
 *
 * The motivation is color transitions, but the implementation suppresses
 * **all** transitions during the two-frame window (see
 * `TRANSITION_SUPPRESS_CLASSES`). Any non-color transition in flight when
 * `applyThemeToDocument` runs will be interrupted; this is generally
 * imperceptible at ~32ms but is a deliberate trade-off, not an accident.
 * CSS keyframe animations are unaffected.
 */
const suppressTransitions = (): void => {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.classList.add(...TRANSITION_SUPPRESS_CLASSES)

  // Force a reflow so the new theme is committed while transitions are still
  // disabled.
  void root.offsetHeight

  const token = ++suppressionToken

  // Restore on the next frame so the swap has a chance to paint without
  // animating. Fall back to a microtask if rAF isn't available (e.g. JSDOM).
  // The token guard ensures only the latest suppression can lift the classes,
  // so overlapping calls don't re-enable transitions mid-swap.
  const cleanup = () => {
    if (token !== suppressionToken) return
    root.classList.remove(...TRANSITION_SUPPRESS_CLASSES)
  }
  if (
    typeof window !== 'undefined' &&
    typeof window.requestAnimationFrame === 'function'
  ) {
    window.requestAnimationFrame(() => window.requestAnimationFrame(cleanup))
  } else {
    setTimeout(cleanup, 0)
  }
}

/**
 * Apply a theme to the `<html>` element by writing the dataset attributes and
 * keeping a single `light`/`dark` class in sync with `data-applied-theme`.
 *
 * The class mirroring keeps Tailwind's `dark:` variant working without
 * requiring consumers to read the dataset.
 *
 * Transitions are briefly suppressed across the document (see
 * `suppressTransitions`) so the swap doesn't trigger a cascade of
 * color/background animations.
 */
export const applyThemeToDocument = (
  theme: Theme,
  resolved: ResolvedTheme,
): void => {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  const isChange =
    root.dataset.appliedTheme !== resolved || root.dataset.theme !== theme

  if (isChange) {
    suppressTransitions()
  }

  for (const candidate of RESOLVED_THEMES) {
    root.classList.remove(candidate)
  }
  root.classList.add(resolved)
  root.dataset.theme = theme
  root.dataset.appliedTheme = resolved
}

export { PREFERS_DARK_QUERY }
