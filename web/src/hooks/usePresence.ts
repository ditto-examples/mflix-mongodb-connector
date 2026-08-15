import { useEffect, useState } from 'react'
import type { PresenceGraph } from '@dittolive/ditto'
import { useDitto } from '../providers/DittoContext'

// Live mesh presence: localPeer (this browser) + remotePeers. Note the
// generic presence Observer stops with .stop(), not .cancel() (unlike
// store observers — a 5.x API quirk recorded in the migration doc).
export function usePresence() {
  const { dittoService, isInitialized } = useDitto()
  const [graph, setGraph] = useState<PresenceGraph | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isInitialized) return
    try {
      const observer = dittoService
        .getDitto()
        .presence.observe((presenceGraph) => setGraph(presenceGraph))
      return () => observer.stop()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to observe presence'
      )
    }
  }, [dittoService, isInitialized])

  return { graph, error }
}
