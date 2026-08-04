import { Card, EmptyState, Heading, ProgressSpinner } from '@dittolive/anvil'
import { usePresence } from '../hooks/usePresence'
import { PresenceGraphView } from '../components/PresenceGraphView'

// Presence viewer (route: /presence) — the mobile apps get this from
// Ditto's tools packages (the "Tools" tab); no web tools package exists,
// so this is our own, built on the presence graph renderer ported from
// vsc-es (see src/presence/README.md).
export function PresenceScreen() {
  const { graph, error } = usePresence()

  if (error) return <EmptyState message={`Presence error: ${error}`} />
  if (!graph) {
    return (
      <div className="flex justify-center py-24">
        <ProgressSpinner />
      </div>
    )
  }

  const local = graph.localPeer

  return (
    <div className="flex flex-col gap-4">
      <Heading level={2} className="!mb-0">
        Presence Viewer
      </Heading>

      <PresenceGraphView graph={graph} />

      <Card>
        <Card.Body className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
          <span>
            <span className="text-foreground-subtle">This peer: </span>
            {local.deviceName || '(unnamed)'}
          </span>
          <span>
            <span className="text-foreground-subtle">SDK: </span>
            {local.dittoSdkVersion ?? 'unknown'}
          </span>
          <span>
            <span className="text-foreground-subtle">OS: </span>
            {local.os ?? 'unknown'}
          </span>
          <span>
            <span className="text-foreground-subtle">Cloud: </span>
            {local.isConnectedToDittoServer ? 'connected' : 'not connected'}
          </span>
          <span>
            <span className="text-foreground-subtle">Remote peers: </span>
            {graph.remotePeers.length}
          </span>
        </Card.Body>
      </Card>
    </div>
  )
}
