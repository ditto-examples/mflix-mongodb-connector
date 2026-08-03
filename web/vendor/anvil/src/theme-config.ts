export const THEMES = [
  'system',
  'light',
  'dark',
  'light-high-contrast',
  'dark-high-contrast',
] as const

export const RESOLVED_THEMES = [
  'light',
  'dark',
  'light-high-contrast',
  'dark-high-contrast',
] as const

export const THEME_STORAGE_KEY = 'portal-ui-theme'
export const DEFAULT_THEME = 'system'

/**
 * Returns the inline script that applies the persisted theme before React
 * loads, preventing a flash of the wrong theme.
 */
export const themeFlashScript = (): string => {
  const config = {
    storageKey: THEME_STORAGE_KEY,
    defaultTheme: DEFAULT_THEME,
    themes: THEMES,
    resolvedThemes: RESOLVED_THEMES,
    prefersDarkModeMediaQuery: '(prefers-color-scheme: dark)',
  }

  // Keep this IIFE ES5-safe so it works without a transpile step.
  return `<script>(function (cfg) {
  var storageKey = cfg.storageKey;
  var defaultTheme = cfg.defaultTheme;
  var themes = cfg.themes;
  var resolvedThemes = cfg.resolvedThemes;
  var darkQuery = cfg.prefersDarkModeMediaQuery;

  function isTheme(v) {
    return typeof v === 'string' && themes.indexOf(v) !== -1;
  }

  function readLocalStorage(key) {
    try {
      return window.localStorage ? window.localStorage.getItem(key) : null;
    } catch (e) {
      return null;
    }
  }

  function resolve(theme, prefersDark) {
    if (theme === 'system') return prefersDark ? 'dark' : 'light';
    return theme;
  }

  var fromStorage = readLocalStorage(storageKey);
  var stored = isTheme(fromStorage) ? fromStorage : defaultTheme;

  var prefersDark = false;
  try {
    prefersDark = window.matchMedia(darkQuery).matches;
  } catch (e) {}

  var applied = resolve(stored, prefersDark);
  var root = document.documentElement;

  if (
    root.dataset.appliedTheme !== applied ||
    root.dataset.theme !== stored
  ) {
    for (var j = 0; j < resolvedThemes.length; j++) {
      root.classList.remove(resolvedThemes[j]);
    }
    root.classList.add(applied);
    root.dataset.theme = stored;
    root.dataset.appliedTheme = applied;
  }
})(${JSON.stringify(config)});</script>`
}
