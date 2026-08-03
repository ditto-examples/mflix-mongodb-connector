import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { DittoService } from '../services/dittoService'
import { DittoContext, type DittoContextValue } from './DittoContext'

// The owner side of the provider pattern: initializes Ditto exactly once and
// broadcasts { dittoService, isInitialized, error } through DittoContext.
// Ported from rn-expo's DittoProvider.tsx; the web-specific notes are inline.
export function DittoProvider({ children }: { children: ReactNode }) {
  // Lazy initializer: getInstance() runs once on first render, not on every
  // re-render.
  const [dittoService] = useState(() => DittoService.getInstance())
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    // Guards state updates after unmount. Under React 18 StrictMode (dev),
    // this effect genuinely runs twice: mount -> cleanup -> mount. The second
    // initDitto() call is a no-op thanks to the service's ditto/isInitializing
    // guards — the double-mount is the test those guards exist to pass.
    let isMounted = true

    // Wired BEFORE init so even a failure during the very first login lands
    // in state. Auth errors can also arrive long after init succeeded (token
    // expiry), which is why this stays wired for the provider's lifetime.
    dittoService.onAuthError = (authError) => {
      if (isMounted) setError(authError)
    }

    dittoService
      .initDitto()
      .then(() => {
        if (isMounted) setIsInitialized(true)
      })
      .catch((initError: unknown) => {
        if (isMounted) {
          setError(
            initError instanceof Error ? initError : new Error(String(initError))
          )
        }
      })

    return () => {
      isMounted = false
      dittoService.onAuthError = null
    }
  }, [dittoService])

  // Memoized so consumers only re-render when one of the three fields
  // actually changes — not on every provider re-render.
  const value = useMemo<DittoContextValue>(
    () => ({ dittoService, isInitialized, error }),
    [dittoService, isInitialized, error]
  )

  return <DittoContext.Provider value={value}>{children}</DittoContext.Provider>
}
