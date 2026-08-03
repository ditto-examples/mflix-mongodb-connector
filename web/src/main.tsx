import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { DittoProvider } from './providers/DittoProvider.tsx'

// Ditto boots because DittoProvider mounts — inside React's world now. The
// walking skeleton (src/skeleton.ts) that used to run here at module level is
// kept on disk as reference but no longer executed.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DittoProvider>
      <App />
    </DittoProvider>
  </StrictMode>,
)
