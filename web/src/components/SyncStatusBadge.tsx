import { useSyncStatus } from '../hooks/useSyncStatus'
import { formatLastUpdate } from '../models/syncStatusInfo'

const DOT_COLOR: Record<string, string> = {
  Connected: 'bg-green-500',
  Connecting: 'bg-amber-500',
  Disconnected: 'bg-red-500',
  'Not Connected': 'bg-red-500',
}

// Compact header widget answering "is this thing actually syncing?" —
// status dot + session state + last-update time for the Big Peer
// connection (on web there's only ever the one websocket session).
// The web-sized port of vsc-es's peer listing / rn-expo's System tab.
export function SyncStatusBadge() {
  const { syncStatuses, isLoading, error } = useSyncStatus()

  if (isLoading || error) return null

  const server =
    syncStatuses.find((s) => s.isDittoServer) ?? syncStatuses[0] ?? null
  if (!server) return null

  return (
    <span
      className="text-foreground-subtle flex items-center gap-2 text-sm"
      title={`Peer: ${server.id}\nSynced to local commit: ${server.syncedUpToLocalCommitId ?? 'n/a'}`}
    >
      <span
        className={`inline-block h-2.5 w-2.5 rounded-full ${DOT_COLOR[server.syncSessionStatus] ?? 'bg-gray-400'}`}
      />
      Big Peer · {server.syncSessionStatus} · last update{' '}
      {formatLastUpdate(server.lastUpdateReceivedTime)}
    </span>
  )
}
