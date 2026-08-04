import { useEffect, useState } from 'react'
import { useDitto } from '../providers/DittoContext'
import {
  syncStatusFromJson,
  type SyncStatusInfo,
} from '../models/syncStatusInfo'

// Live sync-session status from the system:data_sync_info collection.
// Ported from rn-expo's useSyncStatus (cut from v1 scope, restored as the
// web's answer to the mobile System tab) with the usual web fixes: routed
// through useDitto, observer canceled on unmount, no ref/cache machinery.
export function useSyncStatus() {
  const { dittoService, isInitialized } = useDitto()
  const [syncStatuses, setSyncStatuses] = useState<SyncStatusInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isInitialized) return

    try {
      const observer = dittoService.getDitto().store.registerObserver(
        'SELECT * FROM system:data_sync_info ORDER BY documents.sync_session_status, documents.last_update_received_time desc',
        (result) => {
          const statuses = result.items.map((item) =>
            syncStatusFromJson(item.value)
          )
          // Connected sessions first, then most recently updated.
          statuses.sort((a, b) => {
            if (a.syncSessionStatus === 'Connected' && b.syncSessionStatus !== 'Connected') return -1
            if (a.syncSessionStatus !== 'Connected' && b.syncSessionStatus === 'Connected') return 1
            return (b.lastUpdateReceivedTime ?? 0) - (a.lastUpdateReceivedTime ?? 0)
          })
          setSyncStatuses(statuses)
          setIsLoading(false)
        }
      )
      return () => observer.cancel()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sync status')
      setIsLoading(false)
    }
  }, [dittoService, isInitialized])

  return { syncStatuses, isLoading, error }
}
