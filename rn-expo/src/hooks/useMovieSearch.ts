import { useState, useCallback, useEffect } from 'react';
import { MovieListing } from '../models/movieListing';
import { DittoService } from '../services/dittoService';

interface UseMovieSearchResult {
  searchResults: MovieListing[];
  isSearching: boolean;
  searchError: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
}

export const useMovieSearch = (): UseMovieSearchResult => {
  const [searchResults, setSearchResults] = useState<MovieListing[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const searchMovies = useCallback(async (query: string) => {
    const trimmedQuery = query.trim();
    
    if (!trimmedQuery) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    try {
      setIsSearching(true);
      setSearchError(null);
      // Don't clear results here - keep showing previous results until new ones arrive

      const dittoService = DittoService.getInstance();
      const ditto = dittoService.getDitto();

      // Execute search query with LIKE statement
      const results = await ditto.store.execute(
        `SELECT _id, plot, poster, title, year, imdb.rating AS imdbRating, tomatoes.viewer.rating as rottenRating 
         FROM movies 
         WHERE title LIKE :searchTerm AND (rated = 'G' OR rated = 'PG') 
         ORDER BY year DESC`,
        { searchTerm: `%${trimmedQuery}%` }
      );

      // Convert results to MovieListing objects
      const moviesList = results.items.map((item: any) => {
        const data = item.value;
        return new MovieListing(
          data._id || '',
          data.title || '',
          data.plot || '',
          data.poster || '',
          data.year?.toString() || ''
        );
      });

      setSearchResults(moviesList);
      setIsSearching(false);
    } catch (err) {
      console.error('Error searching movies:', err);
      setSearchError(err instanceof Error ? err.message : 'Failed to search movies');
      setSearchResults([]); // Clear results on error
      setIsSearching(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
    setSearchError(null);
  }, []);

  // Immediate search effect - no debouncing
  useEffect(() => {
    if (searchQuery.trim()) {
      // Search immediately on each keystroke
      searchMovies(searchQuery);
    } else {
      // Clear results if search query is empty
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [searchQuery, searchMovies]);

  return {
    searchResults,
    isSearching,
    searchError,
    searchQuery,
    setSearchQuery,
    clearSearch
  };
};