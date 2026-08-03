import type { Decorator, Preview } from '@storybook/react-vite'

import '../src/font/aeonikFono/aeonik.css'
import '../src/font/ibmPlexMono/ibmPlexMono.css'
import '../src/font/inter/inter.css'
import '../src/font/kairos/kairos.css'
import '../src/index.css'

import {
  applyThemeToDocument,
  resolveTheme,
} from '../src/themeProvider/resolve'
import { Theme } from '../src/themeProvider/types'

const withTheme: Decorator = (Story, context) => {
  const theme = (context.globals.theme ?? 'system') as Theme
  applyThemeToDocument(theme, resolveTheme(theme))
  document.body.classList.add('bg-background')
  return Story(context)
}

const preview: Preview = {
  tags: ['autodocs'],
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    options: {
      storySort: {
        method: 'alphabetical',
      },
    },
  },
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Color theme applied to <html>',
      defaultValue: 'system',
      // The actual toolbar UI is registered in `.storybook/manager.tsx` so we
      // can render custom SVG icons for the high-contrast variants. The global
      // is declared here so the preview decorator still receives a `theme`.
    },
  },
  decorators: [withTheme],
}

export default preview
