import { useState, useEffect, useContext } from 'react';
import DittoContext from '../providers/DittoContext';
import { Movie } from '../models/movie';
import { QueryResult } from '@dittolive/ditto';

export const useMovies = () => {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { dittoService, isInitialized } = useContext(DittoContext);

    useEffect(() => {
        if (!isInitialized || !dittoService?.ditto) {
            return;
        }

        console.log('Setting up Ditto observers and subscriptions');
        const registerStoreObserverMovies = () => {
            try {
                const observationQuery = "SELECT * FROM movies ORDER BY year DESC";
                dittoService.storeObserver = dittoService.ditto?.store.registerObserver(observationQuery, (response: QueryResult) => {
                    const fetchedMovies = response.items.map(item => Movie.fromJson(item.value));
                    console.log('fetchedMoviesLength', fetchedMovies.length);
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
                dittoService.syncSubscription = dittoService.ditto?.store.registerSubscription(subscriptionQuery);
            }
            catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to register subscription for movies');
            }
        }

        registerStoreObserverMovies();
        registerSyncSubscriptionMovies();

        // Cleanup function
        return () => {
            dittoService.storeObserver?.stop();
            dittoService.syncSubscription?.stop();
        };
    }, [dittoService, isInitialized]); // Add isInitialized to dependencies

    return { movies, isLoading, error };
}; 