import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@dittolive/anvil'
// Anvil design system styles (vendored source — relative paths on purpose:
// the JS alias can't cover CSS subpaths; switch these two lines to
// '@dittolive/anvil/theme.css' + '/index.css' when the npm package lands).
import '../vendor/anvil/src/theme.css'
import '../vendor/anvil/src/index.css'
// Fonts are opt-in by anvil's design (the package exports ./font/* but
// nothing imports it internally): Kairos = headings, Inter = body text.
import '../vendor/anvil/src/font/kairos/kairos.css'
import '../vendor/anvil/src/font/inter/inter.css'
import './index.css'
import App from './App.tsx'
import { DittoProvider } from './providers/DittoProvider.tsx'

// Ditto boots because DittoProvider mounts — inside React's world now. The
// walking skeleton (src/skeleton.ts) that used to run here at module level is
// kept on disk as reference but no longer executed.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <DittoProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </DittoProvider>
    </ThemeProvider>
  </StrictMode>,
)
