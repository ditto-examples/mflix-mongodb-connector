import { useContext } from 'react';
import DittoContext from '../providers/DittoContext';
import { Movie } from '../models/movie';

/**
 * A custom hook that provides functionality to update existing movies in the Ditto database.
 * This hook handles partial updates to movie documents, only modifying the fields that have changed.
 * 
 * @returns {Object} An object containing:
 * - updateMovie: Function to update a movie in the database
 * 
 * @throws {Error} Throws an error if:
 * - Ditto service is not initialized
 * - No fields have changed
 * - Movie update fails
 * 
 * @remarks
 * - Only modified fields are included in the update query
 * - The function compares current and new values to determine what to update
 * - Arrays (like countries) are compared using JSON stringification
 * - The update is performed using a single SQL-like query
 * 
 * @see https://docs.ditto.live/sdk/latest/crud/update#updating-documents
 */
export const useUpdateMovie = () => {
    const context = useContext(DittoContext);
    if (!context) {
        throw new Error('useUpdateMovie must be used within a DittoProvider');
    }
    const { dittoService } = context;

    const updateMovie = async (movie: Movie, updates: Partial<Movie>) => {
        if (!dittoService?.ditto) {
            throw new Error('Ditto service not initialized');
        }

        const updateFields = [];
        
        if (updates.title !== undefined && updates.title !== movie.title) {
            updateFields.push(`title = '${updates.title}'`);
        }
        if (updates.year !== undefined && updates.year !== movie.year) {
            updateFields.push(`year = '${updates.year}'`);
        }
        if (updates.plot !== undefined && updates.plot !== movie.plot) {
            updateFields.push(`plot = '${updates.plot}'`);
        }
        if (updates.poster !== undefined && updates.poster !== movie.poster) {
            updateFields.push(`poster = '${updates.poster}'`);
        }
        if (updates.fullplot !== undefined && updates.fullplot !== movie.fullplot) {
            updateFields.push(`fullplot = '${updates.fullplot}'`);
        }
        if (updates.countries !== undefined && JSON.stringify(updates.countries) !== JSON.stringify(movie.countries)) {
            const countriesString = updates.countries.map(c => `'${c}'`).join(',');
            updateFields.push(`countries = [${countriesString}]`);
        }

        if (updateFields.length === 0) {
            return;
        }

        const updateQuery = `UPDATE movies SET ${updateFields.join(', ')} WHERE _id = '${movie.id}'`;
        
        try {
            const result = await dittoService.ditto.store.execute(updateQuery);
            if (result.mutatedDocumentIDs().length === 0) {
                throw new Error('No documents were updated');
            }
            return result;
        } catch (error) {
            console.error('Failed to update movie:', error);
            throw error;
        }
    };

    return { updateMovie };
}; 