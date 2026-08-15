import { tags as t } from '@lezer/highlight'
import { type CreateThemeOptions, createTheme } from '@uiw/codemirror-themes'

const codeHighlightStyles = [
  { tag: t.comment, color: 'var(--code-muted)' },
  {
    tag: [t.number, t.bool, t.null, t.tagName],
    color: 'var(--code-literal)',
  },
  {
    tag: [t.string, t.regexp, t.escape, t.attributeName, t.attributeValue],
    color: 'var(--code-string)',
  },
  {
    tag: [t.punctuation, t.separator, t.bracket, t.variableName],
    color: 'var(--code-foreground)',
  },
  { tag: [t.keyword, t.propertyName], color: 'var(--code-keyword)' },
  { tag: t.invalid, color: 'var(--code-literal)' },
]

const createDittoTheme = (theme: CreateThemeOptions['theme']) =>
  createTheme({
    theme,
    settings: {
      background: 'var(--code-background)',
      foreground: 'var(--code-foreground)',
      fontFamily: 'var(--font-plex-mono)',
      fontSize: 'var(--text-sm)',
      caret: 'var(--foreground-subtle)',
      selection: 'var(--code-selection)',
      selectionMatch: 'var(--code-selection-match)',
      lineHighlight: 'var(--code-line-highlight)',
      gutterBackground: 'var(--background-surface)',
      gutterForeground: 'var(--foreground-subtle)',
    },
    styles: codeHighlightStyles,
  })

export const dittoLightTheme = createDittoTheme('light')

export const dittoDarkTheme = createDittoTheme('dark')
