import { createContext, useContext } from 'react'
import type { DittoService } from '../services/dittoService'

// The delivery pipe of the provider pattern: a typed slot that DittoProvider
// fills and every component below it can read. This file owns nothing and
// initializes nothing — that's DittoProvider's job.
//
// Ported from rn-expo's DittoContext.tsx with two fixes: `error` is part of
// the declared type (the RN version supplied it but omitted it from the type,
// so no consumer could read it), and the stale duplicate DittoContextType.ts
// is not carried over.
export interface DittoContextValue {
  dittoService: DittoService
  // false while initDitto() runs; consumers render loading states until the
  // provider flips it. The tree is never blocked, just re-rendered on change.
  isInitialized: boolean
  // Init failures (thrown by initDitto) and async auth failures (surfaced via
  // DittoService.onAuthError, possibly long after init succeeded).
  error: Error | null
}

// null = "no provider above you" — useDitto turns that into a loud error.
export const DittoContext = createContext<DittoContextValue | null>(null)

// The single doorway to Ditto for all hooks and components. Nothing outside
// the provider layer may call DittoService.getInstance() directly — routing
// everything through here is what lets tests swap in a mock service.
export function useDitto(): DittoContextValue {
  const context = useContext(DittoContext)
  if (!context) {
    throw new Error('useDitto must be used inside <DittoProvider>')
  }
  return context
}
