// lib/services/voteService.ts
import { 
  collection, 
  doc, 
  getDocs,
  setDoc, 
  deleteDoc, 
  serverTimestamp,
  updateDoc,
  increment,
  runTransaction,
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { Vote, UserVotesMap } from '../types/types';
import { karmaService } from './karmaService';

export const voteService = {
  async getUserVotes(userId: string, factCheckIds: string[]): Promise<UserVotesMap> {
    try {
      const votesMap: UserVotesMap = {};
      
      await Promise.all(factCheckIds.map(async (factCheckId) => {
        const votesCollectionRef = collection(db, 'factChecks', factCheckId, 'votes');
        const votesDocs = await getDocs(votesCollectionRef);
        
        votesDocs.forEach((doc) => {
          if (doc.id === userId) {
            votesMap[factCheckId] = doc.data().value;
          }
        });
      }));

      return votesMap;
    } catch (error) {
      console.error('Error loading user votes:', error);
      throw error;
    }
  },
  

  async submitVote(
    factCheckId: string, 
    userId: string, 
    value: number,
    previousValue: number = 0
  ): Promise<void> {
    try {
      const voteRef = doc(db, 'factChecks', factCheckId, 'votes', userId);
      const factCheckRef = doc(db, 'factChecks', factCheckId);
      let updatedFactCheck;
  
      await runTransaction(db, async (transaction) => {
        const factCheckDoc = await transaction.get(factCheckRef);
        if (!factCheckDoc.exists()) {
          throw new Error('Fact check not found');
        }
  
        const currentData = factCheckDoc.data();
        let newUpvotes = Math.max(0, currentData.upvotes || 0);
        let newDownvotes = Math.max(0, currentData.downvotes || 0);
  
        // Handle vote changes
        if (previousValue === value) {
          // Clicking same button again - remove vote
          if (value === 1) newUpvotes = Math.max(0, newUpvotes - 1);
          if (value === -1) newDownvotes = Math.max(0, newDownvotes - 1);
          value = 0; // Reset value to indicate no vote
        } else {
          // Remove previous vote if exists
          if (previousValue === 1) newUpvotes = Math.max(0, newUpvotes - 1);
          if (previousValue === -1) newDownvotes = Math.max(0, newDownvotes - 1);
          
          // Add new vote
          if (value === 1) newUpvotes += 1;
          if (value === -1) newDownvotes += 1;
        }
  
        // Update or delete vote document
        if (value === 0) {
          transaction.delete(voteRef);
        } else {
          transaction.set(voteRef, {
            value,
            timestamp: serverTimestamp()
          });
        }
  
        const updates = {
          upvotes: newUpvotes,
          downvotes: newDownvotes,
          updatedAt: serverTimestamp()
        };
  
        transaction.update(factCheckRef, updates);
        updatedFactCheck = { ...currentData, ...updates };
      });
  
      // Handle karma updates after successful vote transaction
      if (updatedFactCheck?.submittedBy && value !== previousValue) {
        // Only give karma if not voting on own content
        if (updatedFactCheck.submittedBy !== userId) {
          try {
            if (value === 1) {
              await karmaService.addKarmaHistoryEntry(
                updatedFactCheck.submittedBy,
                'FACT_UPVOTED',
                factCheckId
              );
            } else if (value === -1) {
              await karmaService.addKarmaHistoryEntry(
                updatedFactCheck.submittedBy,
                'FACT_DOWNVOTED',
                factCheckId
              );
            }
          } catch (karmaError) {
            console.error('Error updating recipient karma:', karmaError);
          }
        }
  
        // Add karma for giving votes
        try {
          if (value === 1) {
            await karmaService.addKarmaHistoryEntry(
              userId,
              'UPVOTE_GIVEN',
              factCheckId
            );
          } else if (value === -1 && updatedFactCheck.moderatorValidation) {
            const karmaAction = updatedFactCheck.moderatorValidation === 'VALIDATED_TRUE' 
              ? 'DOWNVOTE_VALIDATED_FACT' 
              : updatedFactCheck.moderatorValidation === 'VALIDATED_FALSE'
                ? 'DOWNVOTE_CORRECT'
                : null;
  
            if (karmaAction) {
              await karmaService.addKarmaHistoryEntry(
                userId,
                karmaAction,
                factCheckId
              );
            }
          }
        } catch (karmaError) {
          console.error('Error updating voter karma:', karmaError);
        }
      }
    } catch (error) {
      console.error('Error submitting vote:', error);
      throw error;
    }
  },

  async getVoteCounts(factCheckId: string): Promise<{ upvotes: number; downvotes: number }> {
    try {
      const votesRef = collection(db, 'factChecks', factCheckId, 'votes');
      const votesSnapshot = await getDocs(votesRef);
      
      let upvotes = 0;
      let downvotes = 0;
      
      votesSnapshot.forEach((doc) => {
        const value = doc.data().value;
        if (value === 1) upvotes++;
        else if (value === -1) downvotes++;
      });
      
      return { upvotes, downvotes };
    } catch (error) {
      console.error('Error calculating vote counts:', error);
      throw error;
    }
  }
};