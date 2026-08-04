// Sync session info from the system:data_sync_info collection — one row per
// connected peer. On web there is exactly one: the Big Peer websocket.
// Ported from rn-expo's SyncStatusInfo class as interface + functions.
export interface SyncStatusInfo {
  id: string
  isDittoServer: boolean
  syncSessionStatus: string
  syncedUpToLocalCommitId: number | null
  lastUpdateReceivedTime: number | null
}

export function syncStatusFromJson(json: any): SyncStatusInfo {
  return {
    id: json._id ?? json.id ?? '',
    isDittoServer: json.is_ditto_server ?? false,
    syncSessionStatus: json.documents?.sync_session_status ?? 'Unknown',
    syncedUpToLocalCommitId:
      json.documents?.synced_up_to_local_commit_id ?? null,
    lastUpdateReceivedTime: json.documents?.last_update_received_time ?? null,
  }
}

// "Just now" / "5 minutes ago" / "Today, 3:12 PM" — same buckets as the
// rn-expo formattedLastUpdate getter (input is epoch milliseconds).
export function formatLastUpdate(ms: number | null): string {
  if (!ms) return 'Never'
  const date = new Date(ms)
  const now = new Date()
  const diffMins = Math.floor((now.getTime() - date.getTime()) / 60000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`

  const time: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }
  if (date.toDateString() === now.toDateString()) {
    return `Today, ${date.toLocaleTimeString('en-US', time)}`
  }
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...time,
  })
}
