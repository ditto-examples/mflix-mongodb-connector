import { useContext } from 'react';
import DittoContext from '../providers/DittoContext';
import { Movie } from '../models/movie';
import { DittoService } from '../services/dittoService';

/**
 * A custom hook that provides functionality to add new movies to the Ditto database.
 * This hook handles the creation of new movie documents with all required fields.
 * 
 * @returns {Object} An object containing:
 * - addMovie: Function to add a new movie to the database
 * 
 * @throws {Error} Throws an error if:
 * - Ditto service is not initialized
 * - Movie insertion fails
 * 
 * @remarks
 * - The hook automatically sets default values for required fields
 * - All movies are set with a default 'G' rating
 * - Empty arrays are set for optional array fields if not provided
 * - IMDB ratings are initialized to 0
 * 
 * @see https://docs.ditto.live/sdk/latest/crud/create#creating-documents
 */
export const useAddMovie = () => {
    const context = useContext(DittoContext);
    if (!context) {
        throw new Error('useAddMovie must be used within a DittoProvider');
    }
    const { dittoService } = context;

    const addMovie = async (movieData: Partial<Movie>) => {
        if (!dittoService?.ditto) {
            throw new Error('Ditto service not initialized');
        }

        try {
            const newMovie = {
                title: movieData.title || '',
                year: movieData.year || '',
                plot: movieData.plot || '',
                poster: movieData.poster || '',
                fullplot: movieData.fullplot || '',
                countries: movieData.countries || [],
                rated: 'G', // Default rating for new movies
                genres: movieData.genres || [],
                directors: movieData.directors || [],
                languages: movieData.languages || [],
                imdb: {
                    rating: 0,
                    votes: 0
                }
            };
            
            const result = await dittoService.ditto.store.execute(
                "INSERT INTO movies DOCUMENTS (:newMovie)",
                { newMovie }
            );

            if (result.mutatedDocumentIDs().length === 0) {
                throw new Error('Failed to add movie');
            }

            return result;
        } catch (error) {
            console.error('Failed to add movie:', error);
            throw error;
        }
    };

    return { addMovie };
}; 