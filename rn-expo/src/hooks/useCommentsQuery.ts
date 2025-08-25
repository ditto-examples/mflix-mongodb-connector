import { useState, useEffect, useCallback } from 'react';
import { Comment } from '../models/comment';
import { DittoService } from '../services/dittoService';

interface UseCommentsQueryResult {
  comments: Comment[];
  isLoading: boolean;
  error: string | null;
  addComment: (text: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export const useCommentsQuery = (movieId: string | undefined): UseCommentsQueryResult => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    if (!movieId) {
      setComments([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const dittoService = DittoService.getInstance();
      const ditto = dittoService.getDitto();

      // Use store.execute to fetch comments directly
      const query = `SELECT * FROM comments WHERE movie_id = :movieId ORDER BY date DESC`;
      const result = await ditto.store.execute(query,
        { movieId: `${movieId}` }
      );
      
      // Convert the result to Comment objects
      const commentsList = result.items.map((item: any) => Comment.fromJson(item.value));
      setComments(commentsList);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch comments');
      setIsLoading(false);
    }
  }, [movieId]);

  const addComment = useCallback(async (text: string) => {
    if (!movieId) {
      throw new Error('Movie ID is required');
    }

    try {
      const dittoService = DittoService.getInstance();
      const ditto = dittoService.getDitto();

      // Create new comment with anonymous name and no email
      const newComment = {
        name: 'Anonymous',
        email: '',
        movie_id: movieId,
        text: text,
        date: new Date().toISOString()
      };

      // Insert comment into database
      await ditto.store.execute(
        `INSERT INTO comments DOCUMENTS (:newComment)`,
        { newComment }
      );

      // Immediately refresh comments to show the new one
      await fetchComments();
    } catch (err) {
      console.error('Error adding comment:', err);
      throw err;
    }
  }, [movieId, fetchComments]);

  const refresh = useCallback(async () => {
    await fetchComments();
  }, [fetchComments]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return {
    comments,
    isLoading,
    error,
    addComment,
    refresh
  };
};