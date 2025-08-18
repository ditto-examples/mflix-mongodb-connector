import { useState, useEffect, useContext, useRef, useMemo } from 'react';
import DittoContext from '../providers/DittoContext';
import { SyncStatusInfo } from '../models/syncStatusInfo';
import { QueryResult } from '@dittolive/ditto';

/**
 * A custom hook that manages sync status information from the Ditto database.
 * This hook provides real-time updates through a store observer and maintains
 * the observer across component unmounts to prevent recreating it.
 * 
 * @returns {Object} An object containing:
 * - syncStatuses: Array of SyncStatusInfo objects
 * - isLoading: Boolean indicating if the initial load is in progress
 * - error: Error message if the fetch failed
 * 
 * @remarks
 * - Uses a store observer to maintain real-time updates of sync status
 * - Observer is only registered once and persists across component lifecycle
 * - Sync statuses are sorted by connection status and last update time
 * - Data is memoized to prevent unnecessary re-renders
 * 
 * @see https://docs.ditto.live/sdk/latest/crud/read#reacting-to-data-changes
 */
export const useSyncStatus = () => {
    const [syncStatusData, setSyncStatusData] = useState<SyncStatusInfo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const observerRegistered = useRef(false);
    const statusCache = useRef<SyncStatusInfo[]>([]);
    
    const context = useContext(DittoContext);
    if (!context) {
        throw new Error('useSyncStatus must be used within a DittoProvider');
    }
    const { dittoService, isInitialized } = context;

    // Memoize the sync statuses array to prevent unnecessary re-renders
    const syncStatuses = useMemo(() => syncStatusData, [syncStatusData]);

    useEffect(() => {
        if (!isInitialized || !dittoService?.ditto) {
            return;
        }

        // If we have cached statuses and observer is already registered, use cached data
        if (observerRegistered.current && statusCache.current.length > 0) {
            setSyncStatusData(statusCache.current);
            setIsLoading(false);
            return;
        }

        // Only register the observer once
        if (!observerRegistered.current) {
            const registerSyncStatusObserver = () => {
                try {
                    const observationQuery = "SELECT * FROM system:data_sync_info ORDER BY documents.sync_session_status, documents.last_update_received_time desc";
                    
                    dittoService.syncStatusObserver = dittoService.ditto?.store.registerObserver(
                        observationQuery, 
                        (response: QueryResult) => {
                            const fetchedStatuses = response.items.map(item => {
                                const statusData = item.value || item;
                                return SyncStatusInfo.fromJson(statusData);
                            });
                            
                            // Sort: Connected first, then by last update time
                            fetchedStatuses.sort((a, b) => {
                                // First sort by connection status
                                if (a.syncSessionStatus === 'Connected' && b.syncSessionStatus !== 'Connected') return -1;
                                if (a.syncSessionStatus !== 'Connected' && b.syncSessionStatus === 'Connected') return 1;
                                
                                // Then sort by last update time (most recent first)
                                const timeA = a.lastUpdateReceivedTime || 0;
                                const timeB = b.lastUpdateReceivedTime || 0;
                                return timeB - timeA;
                            });
                            
                            statusCache.current = fetchedStatuses; // Update cache
                            setSyncStatusData(fetchedStatuses);
                            setIsLoading(false);
                        }
                    );
                    observerRegistered.current = true;
                    
                } catch (err) {
                    console.log("Error in registering sync status observer: ", err);
                    setError(err instanceof Error ? err.message : 'Failed to fetch sync status');
                    setIsLoading(false);
                }
            };
            registerSyncStatusObserver();
        }

        // No cleanup - we want to keep the observer active
        return () => { };
    }, [dittoService, isInitialized]);

    return { syncStatuses, isLoading, error };
};