import { create } from 'zustand'
import { type PersistStorage, persist } from 'zustand/middleware'

import {
  DEFAULT_THEME,
  isTheme,
  ResolvedTheme,
  Theme,
  THEME_STORAGE_KEY,
} from './types'

type ThemeStore = {
  /** The user's selected theme — may be `system`. */
  theme: Theme
  /** The actual theme applied to the DOM — never `system`. */
  resolvedTheme: ResolvedTheme
  /** Whether the OS prefers dark mode. Updated by `ThemeProvider`. */
  systemPrefersDark: boolean
  /** Persist a new theme choice. */
  setTheme: (theme: Theme) => void
  /** Update the cached OS dark-mode preference. */
  setSystemPrefersDark: (prefersDark: boolean) => void
}

const resolve = (theme: Theme, systemPrefersDark: boolean): ResolvedTheme => {
  if (theme === 'system') return systemPrefersDark ? 'dark' : 'light'
  return theme
}

/**
 * Custom `localStorage` adapter that stores the theme as a raw string
 * (e.g. `"dark"`) rather than zustand's default JSON envelope. This keeps the
 * inline FOUC-prevention script trivial — it just calls `getItem` and checks
 * the value against the known theme list, no JSON parsing required.
 */
const rawStringStorage: PersistStorage<Pick<ThemeStore, 'theme'>> = {
  getItem: (name) => {
    if (typeof window === 'undefined') return null
    try {
      const value = window.localStorage.getItem(name)
      return isTheme(value) ? { state: { theme: value }, version: 0 } : null
    } catch {
      return null
    }
  },
  setItem: (name, value) => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(name, value.state.theme)
    } catch {
      // localStorage unavailable (private mode, quota, etc.) — silently ignore.
    }
  },
  removeItem: (name) => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.removeItem(name)
    } catch {
      // ignore
    }
  },
}

const initialSystemPrefersDark = (): boolean => {
  if (
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function'
  ) {
    return false
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

/**
 * Global theme store. Persists the user's choice to `localStorage` under
 * `THEME_STORAGE_KEY` so the FOUC script can read it before React boots.
 *
 * `resolvedTheme` is derived from `theme` and `systemPrefersDark` and is kept
 * in sync inside the setters — consumers can subscribe to it directly without
 * doing the resolution themselves.
 *
 * Most consumers should use the `useTheme()` hook from `ThemeProvider`.
 */
export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => {
      const initialPrefersDark = initialSystemPrefersDark()
      return {
        theme: DEFAULT_THEME,
        systemPrefersDark: initialPrefersDark,
        resolvedTheme: resolve(DEFAULT_THEME, initialPrefersDark),
        setTheme: (theme) =>
          set({
            theme,
            resolvedTheme: resolve(theme, get().systemPrefersDark),
          }),
        setSystemPrefersDark: (systemPrefersDark) =>
          set({
            systemPrefersDark,
            resolvedTheme: resolve(get().theme, systemPrefersDark),
          }),
      }
    },
    {
      name: THEME_STORAGE_KEY,
      storage: rawStringStorage,
      partialize: (state) => ({ theme: state.theme }),
      // After rehydrating the persisted `theme`, re-derive `resolvedTheme`.
      onRehydrateStorage: () => (state) => {
        if (!state) return
        state.resolvedTheme = resolve(state.theme, state.systemPrefersDark)
      },
    },
  ),
)
