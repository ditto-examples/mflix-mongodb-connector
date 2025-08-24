import { useState, useEffect, useCallback, useRef } from 'react';
import { Comment } from '../models/comment';
import { DittoService } from '../services/dittoService';
import { StoreObserver } from '@dittolive/ditto';

interface UseCommentsResult {
  comments: Comment[];
  isLoading: boolean;
  error: string | null;
  addComment: (text: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export const useComments = (movieId: string | undefined): UseCommentsResult => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const observerRef = useRef<StoreObserver | null>(null);

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

      // Clean up existing observer
      if (observerRef.current) {
        observerRef.current.cancel();
      }

      // Execute DQL query with movieId parameter
      const query = `SELECT * FROM comments WHERE movie_id = '${movieId}' ORDER BY date DESC`;
      
      // Set up observer for real-time updates
      observerRef.current = await ditto.store.registerObserver(
        query,
        (result: any) => {
          const commentsList = result.items.map((item: any) => Comment.fromJson(item.value));
          setComments(commentsList);
          setIsLoading(false);
        }
      );
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

      // Refresh comments to show the new one
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

    // Cleanup observer on unmount
    return () => {
      if (observerRef.current) {
        observerRef.current.cancel();
        observerRef.current = null;
      }
    };
  }, [fetchComments]);

  return {
    comments,
    isLoading,
    error,
    addComment,
    refresh
  };
};