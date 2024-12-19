// src/hooks/useComments.ts
import { useState, useEffect } from 'react';
import { useAuth } from '../lib/context/AuthContext';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase/firebaseConfig';
import { commentService } from '../lib/services';
import type { Comment } from '../lib/types/types';

export function useComments(factCheckId: string) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [userVotes, setUserVotes] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load comments and user votes
  useEffect(() => {
    if (!factCheckId) return;

    setLoading(true);
    setError(null);

    const commentsRef = collection(db, 'comments');
    const q = query(commentsRef, where('factCheckId', '==', factCheckId));

    const unsubscribe = onSnapshot(q, 
      async (snapshot) => {
        try {
          const commentsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate(),
            updatedAt: doc.data().updatedAt?.toDate(),
            deletedAt: doc.data().deletedAt?.toDate()
          })) as Comment[];

          setComments(commentsData);

          // Load user votes if user is logged in
          if (user) {
            const votes = await commentService.getUserVotes(
              user.uid, 
              commentsData.map(c => c.id)
            );
            setUserVotes(votes);
          }

          setLoading(false);
        } catch (err) {
          console.error('Error processing comments:', err);
          setError(err instanceof Error ? err.message : 'Error loading comments');
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error in comments subscription:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [factCheckId, user]);

  const addComment = async (content: string, parentCommentId: string | null = null) => {
    if (!user) return;

    try {
      const commentId = await commentService.createComment(
        factCheckId,
        user.uid,
        content,
        parentCommentId
      );

      // Optimistic update not needed due to onSnapshot
      return commentId;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  };

  const handleVote = async (commentId: string, value: number) => {
    if (!user) return;

    try {
      const previousValue = userVotes[commentId] || 0;
      if (previousValue === value) return;

      // Optimistic update
      setUserVotes(prev => ({ ...prev, [commentId]: value }));

      await commentService.submitVote(commentId, user.uid, value, previousValue);
    } catch (error) {
      // Revert optimistic update on error
      setUserVotes(prev => ({ ...prev, [commentId]: userVotes[commentId] }));
      console.error('Error submitting vote:', error);
      throw error;
    }
  };

  const deleteComment = async (commentId: string, reason?: string) => {
    if (!user) return;

    try {
      await commentService.deleteComment(commentId, user.uid, reason);
      // No need for optimistic update due to onSnapshot
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  };

  return {
    comments,
    userVotes,
    loading,
    error,
    addComment,
    handleVote,
    deleteComment
  };
}