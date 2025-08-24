import { useState, useEffect, useContext, useRef, useMemo } from 'react';
import DittoContext from '../providers/DittoContext';
import { MovieListing } from '../models/movieListing';
import { QueryResult } from '@dittolive/ditto';

/**
 * An optimized custom hook that manages a list of movies from the Ditto database.
 * This hook prevents unnecessary database pulls when switching between tabs.
 * 
 * @returns {Object} An object containing:
 * - movies: Array of MovieListing objects (memoized to prevent unnecessary re-renders)
 * - isLoading: Boolean indicating if the initial load is in progress
 * - error: Error message if the fetch failed
 * 
 * @remarks
 * - Uses a store observer to maintain real-time updates of the movies list
 * - Movies are sorted by year in descending order
 * - Observer is only registered once and persists across tab switches
 * - Movies array is memoized to prevent unnecessary re-renders
 * - Handles loading and error states
 * 
 * @see https://docs.ditto.live/sdk/latest/crud/read#reacting-to-data-changes
 */
export const useMovies = () => {
    const [moviesData, setMoviesData] = useState<MovieListing[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const observerRegistered = useRef(false);
    const moviesCache = useRef<MovieListing[]>([]);
    
    const context = useContext(DittoContext);
    if (!context) {
        throw new Error('useMovies must be used within a DittoProvider');
    }
    const { dittoService, isInitialized } = context;

    // Memoize the movies array to prevent unnecessary re-renders
    const movies = useMemo(() => moviesData, [moviesData]);

    useEffect(() => {
        if (!isInitialized || !dittoService?.ditto) {
            return;
        }

        // If we have cached movies and observer is already registered, use cached data
        if (observerRegistered.current && moviesCache.current.length > 0) {
            setMoviesData(moviesCache.current);
            setIsLoading(false);
            return;
        }

        // Only register the observer once
        if (!observerRegistered.current) {
            const registerStoreObserverMovies = () => {
                try {
                    const observationQuery = "SELECT _id, plot, poster, title, year FROM movies ORDER BY year DESC";
                    dittoService.movieObserver = dittoService.ditto?.store.registerObserver(
                        observationQuery, 
                        (response: QueryResult) => {
                            const fetchedMovies = response.items.map(item => MovieListing.fromJson(item.value));
                            moviesCache.current = fetchedMovies; // Update cache
                            setMoviesData(fetchedMovies);
                            setIsLoading(false);
                        }
                    );
                    observerRegistered.current = true;
                    
                } catch (err) {
                    console.log("Error in registering store observer for movies: ", err);
                    setError(err instanceof Error ? err.message : 'Failed to fetch movies');
                    setIsLoading(false);
                }
            };
            registerStoreObserverMovies();
        }

        // No cleanup - we want to keep the observer active
        return () => { };
    }, [dittoService, isInitialized]);

    return { movies, isLoading, error };
};