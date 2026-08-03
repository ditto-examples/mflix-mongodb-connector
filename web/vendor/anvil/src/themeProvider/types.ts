import { RESOLVED_THEMES, THEMES } from '../theme-config'

export {
  DEFAULT_THEME,
  RESOLVED_THEMES,
  THEME_STORAGE_KEY,
  THEMES,
} from '../theme-config'

/**
 * The set of themes the user can pick from in the UI.
 *
 * `system` defers to the OS-level `prefers-color-scheme` media query and
 * resolves to either `light` or `dark` at runtime.
 *
 * `light-high-contrast` and `dark-high-contrast` are explicit user choices —
 * they do not participate in `system` resolution.
 */
export type Theme = (typeof THEMES)[number]

/**
 * The set of themes that can actually be applied to the DOM.
 *
 * `system` is never an applied theme — it always resolves to one of these.
 * The high-contrast variants resolve to themselves.
 */
export type ResolvedTheme = (typeof RESOLVED_THEMES)[number]

/** Type guard for `Theme`. */
export const isTheme = (value: unknown): value is Theme =>
  typeof value === 'string' && (THEMES as readonly string[]).includes(value)
