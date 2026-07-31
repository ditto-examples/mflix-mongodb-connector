import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { runSkeleton } from './skeleton.ts'

// Skeleton runs once at module level, outside React entirely — so StrictMode's
// double-mounting can't double-init Ditto. (The real app moves this into
// DittoProvider, which needs its own idempotence guard for exactly that reason.)
runSkeleton().catch((err) => {
  console.error('[skeleton] init failed:', err)
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
