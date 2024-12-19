// src/lib/services/commentService.ts
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp, 
  increment,
  runTransaction
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { notificationService } from './notificationService';
import { karmaService } from './karmaService';
import type { Comment } from '../types/types';

export const commentService = {
  async getCommentsForFactCheck(factCheckId: string): Promise<Comment[]> {
    try {
      const q = query(
        collection(db, 'comments'),
        where('factCheckId', '==', factCheckId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Comment[];
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  },

  async createComment(
    factCheckId: string, 
    userId: string, 
    content: string, 
    parentCommentId: string | null = null
  ): Promise<string> {
    try {
      // Create the comment
      const commentData = {
        factCheckId,
        userId,
        content,
        parentCommentId,
        upvotes: 0,
        downvotes: 0,
        isDeleted: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const commentRef = await addDoc(collection(db, 'comments'), commentData);

      // Add karma for submitting a comment
      await karmaService.addKarmaHistoryEntry(
        userId,
        'SUBMIT_COMMENT',
        commentRef.id
      );

      // Handle notification for reply
      if (parentCommentId) {
        const parentCommentRef = doc(db, 'comments', parentCommentId);
        const parentCommentSnap = await getDoc(parentCommentRef);
        
        if (parentCommentSnap.exists()) {
          const parentComment = parentCommentSnap.data();
          
          // Only notify if replying to someone else's comment
          if (parentComment.userId !== userId) {
            await notificationService.createNotification({
              userId: parentComment.userId,
              factCheckId: parentComment.factCheckId,
              message: `Someone replied to your comment: "${content.substring(0, 100)}${content.length > 100 ? '...' : ''}"`,
              type: 'COMMENT_REPLY'
            });
          }
        }
      }

      return commentRef.id;
    } catch (error) {
      console.error('Error in createComment:', error);
      throw error;
    }
  },

  async submitVote(
    commentId: string, 
    userId: string, 
    value: number, 
    previousValue: number = 0
  ): Promise<void> {
    try {
      const voteRef = doc(db, 'comments', commentId, 'votes', userId);
      const commentRef = doc(db, 'comments', commentId);

      await runTransaction(db, async (transaction) => {
        const commentDoc = await transaction.get(commentRef);
        if (!commentDoc.exists()) {
          throw new Error('Comment not found');
        }

        const comment = commentDoc.data();
        const currentData = commentDoc.data();
        let newUpvotes = currentData.upvotes || 0;
        let newDownvotes = currentData.downvotes || 0;

        // Remove previous vote
        if (previousValue === 1) newUpvotes--;
        if (previousValue === -1) newDownvotes--;

        // Add new vote
        if (value === 1) newUpvotes++;
        if (value === -1) newDownvotes++;

        // Update or delete vote document
        if (value === 0) {
          transaction.delete(voteRef);
        } else {
          transaction.set(voteRef, {
            value,
            timestamp: serverTimestamp()
          });
        }

        // Update comment vote counts
        transaction.update(commentRef, {
          upvotes: newUpvotes,
          downvotes: newDownvotes,
          updatedAt: serverTimestamp()
        });

        // Handle karma for the vote recipient
        if (comment.userId && value !== previousValue) {
          if (value === 1) {
            await karmaService.addKarmaHistoryEntry(
              comment.userId,
              'COMMENT_UPVOTED',
              commentId
            );
          } else if (value === -1) {
            await karmaService.addKarmaHistoryEntry(
              comment.userId,
              'COMMENT_DOWNVOTED',
              commentId
            );
          }
        }
      });
    } catch (error) {
      console.error('Error submitting vote:', error);
      throw error;
    }
  },

  async getUserVotes(userId: string, commentIds: string[]) {
    try {
      const votesMap: { [key: string]: number } = {};
      
      await Promise.all(commentIds.map(async (commentId) => {
        const voteRef = doc(db, 'comments', commentId, 'votes', userId);
        const voteDoc = await getDoc(voteRef);
        if (voteDoc.exists()) {
          votesMap[commentId] = voteDoc.data().value;
        }
      }));

      return votesMap;
    } catch (error) {
      console.error('Error fetching user votes:', error);
      throw error;
    }
  },

  async deleteComment(commentId: string, userId: string, reason: string = '') {
    try {
      const commentRef = doc(db, 'comments', commentId);
      const commentDoc = await getDoc(commentRef);
      
      if (!commentDoc.exists()) {
        throw new Error('Comment not found');
      }

      const commentData = commentDoc.data();
      const isModeratorAction = userId !== commentData.userId;

      const updateData = {
        isDeleted: true,
        content: isModeratorAction 
          ? `Comment deleted by moderator${reason ? `: ${reason}` : ''}`
          : 'This comment was deleted by the user',
        moderatorReason: isModeratorAction ? reason : null,
        deletedAt: serverTimestamp(),
        deletedBy: userId
      };

      await updateDoc(commentRef, updateData);

      // Send notification if it's a moderator action
      if (isModeratorAction) {
        await notificationService.createNotification({
          userId: commentData.userId,
          factCheckId: commentData.factCheckId,
          message: `Your comment was deleted by a moderator${reason ? `. Reason: ${reason}` : '.'}`,
          type: 'MODERATION'
        });

        // Add negative karma for having comment deleted by moderator
        await karmaService.addKarmaHistoryEntry(
          commentData.userId,
          'COMMENT_DOWNVOTED',
          commentId
        );
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }
};