import { useState, useEffect, useContext } from 'react';
import DittoContext from '../providers/DittoContext';
import { Movie } from '../models/movie';
import { QueryResult } from '@dittolive/ditto';

/**
 * A custom hook that manages a list of movies from the Ditto database.
 * This hook provides real-time updates through a store observer and sync subscription.
 * 
 * @returns {Object} An object containing:
 * - movies: Array of Movie objects
 * - isLoading: Boolean indicating if the initial load is in progress
 * - error: Error message if the fetch failed
 * 
 * @remarks
 * - Uses a store observer to maintain real-time updates of the movies list
 * - Movies are sorted by year in descending order
 * - Includes a sync subscription for 'G' rated movies
 * - Automatically updates when changes occur in the database
 * - Handles loading and error states
 * 
 * @see https://docs.ditto.live/sdk/latest/crud/read#reacting-to-data-changes
 */
export const useMovies = () => {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const context = useContext(DittoContext);
    if (!context) {
        throw new Error('useMovies must be used within a DittoProvider');
    }
    const { dittoService, isInitialized } = context;

    useEffect(() => {
        if (!isInitialized || !dittoService?.ditto) {
            return;
        }
        const registerStoreObserverMovies = () => {
            try {
                const observationQuery = "SELECT * FROM movies ORDER BY year DESC";
                dittoService.storeObserver = dittoService.ditto?.store.registerObserver(observationQuery, (response: QueryResult) => {
                    const fetchedMovies = response.items.map(item => Movie.fromJson(item.value));
                    setMovies(fetchedMovies);
                });
                
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch movies');
            } finally {
                setIsLoading(false);
            }
        };

        const registerSyncSubscriptionMovies = () => {
            try {
                const subscriptionQuery = "SELECT * FROM movies WHERE rated = 'G'";
                dittoService.syncSubscription = dittoService.ditto?.sync.registerSubscription(subscriptionQuery);
            }
            catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to register subscription for movies');
            }
        }

        registerStoreObserverMovies();
        registerSyncSubscriptionMovies();

        // Cleanup function
        return () => {
        };
    }, [dittoService, isInitialized]);

    return { movies, isLoading, error };
}; 