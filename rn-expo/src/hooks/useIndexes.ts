import { useState, useEffect, useContext } from 'react';
import DittoContext from '../providers/DittoContext';
import { IndexInfo } from '../models/indexInfo';
import { QueryResult } from '@dittolive/ditto';

/**
 * A custom hook that fetches and manages database indexes from the Ditto store.
 * This hook queries the system:indexes collection to retrieve index information.
 * 
 * @returns {Object} An object containing:
 * - indexes: Array of IndexInfo objects
 * - isLoading: Boolean indicating if the fetch is in progress
 * - error: Error message if the fetch failed
 * - refresh: Function to manually refresh the indexes
 * 
 * @remarks
 * - Queries the system:indexes collection using DQL
 * - Automatically fetches indexes on mount
 * - Provides a refresh function for manual updates
 */
export const useIndexes = () => {
    const [indexes, setIndexes] = useState<IndexInfo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const context = useContext(DittoContext);
    if (!context) {
        throw new Error('useIndexes must be used within a DittoProvider');
    }
    const { dittoService, isInitialized } = context;

    const fetchIndexes = async () => {
        if (!isInitialized || !dittoService?.ditto) {
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            
            // Query the system indexes collection
            const query = "SELECT * FROM system:indexes";
            const result = await dittoService.ditto.store.execute(query);
            
            const fetchedIndexes = result.items.map(item => {
                const indexData = item.value || item;
                return IndexInfo.fromJson(indexData);
            });
            
            setIndexes(fetchedIndexes);
        } catch (err) {
            console.log("Error fetching indexes: ", err);
            setError(err instanceof Error ? err.message : 'Failed to fetch indexes');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchIndexes();
    }, [dittoService, isInitialized]);

    return { 
        indexes, 
        isLoading, 
        error,
        refresh: fetchIndexes
    };
};