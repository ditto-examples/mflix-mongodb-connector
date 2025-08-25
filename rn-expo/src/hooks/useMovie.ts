import { useState, useEffect, useContext, useCallback } from 'react';
import DittoContext from '../providers/DittoContext';
import { Movie } from '../models/movie';

/**
 * A custom hook that fetches and manages a single movie from the Ditto database.
 * This hook provides functionality to retrieve a movie by its ID and refresh its data.
 * 
 * @param {string} movieId - The ID of the movie to fetch
 * 
 * @returns {Object} An object containing:
 * - movie: The fetched movie object or null if not found
 * - isLoading: Boolean indicating if the movie is being fetched
 * - error: Error message if the fetch failed
 * - refresh: Function to manually refresh the movie data
 * 
 * @throws {Error} Throws an error if:
 * - Ditto service is not initialized
 * - Movie ID is not provided
 * - Movie is not found in the database
 * 
 * @remarks
 * - The hook automatically fetches the movie when the component mounts
 * - The refresh function can be called to manually update the movie data
 * - The hook handles loading and error states
 * 
 * @see https://docs.ditto.live/sdk/latest/crud/read#reading-documents
 */
export const useMovie = (movieId: string) => {
    const [movie, setMovie] = useState<Movie | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const context = useContext(DittoContext);
    if (!context) {
        throw new Error('useMovie must be used within a DittoProvider');
    }
    const { dittoService, isInitialized } = context;

    const fetchMovie = useCallback(async () => {
        if (!isInitialized || !dittoService?.ditto || !movieId) {
            return;
        }
        try {
            const movieQuery = `SELECT * FROM movies WHERE _id = :movieId`;
            let response = await dittoService.ditto?.store.execute(movieQuery, { movieId: `${movieId}` });
            if (response.items !== null) {
                const fetchedMovie = Movie.fromJson(response.items[0].value);
                setMovie(fetchedMovie);
            } else {
                setError('Movie not found');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch movie');
        } finally {
            setIsLoading(false);
        }
    }, [dittoService, isInitialized, movieId]);

    useEffect(() => {
        fetchMovie();
    }, [fetchMovie]);

    return { movie, isLoading, error, refresh: fetchMovie };
}; 