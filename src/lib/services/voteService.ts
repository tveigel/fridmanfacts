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
  
// Modify the submitVote method
async submitVote(
  factCheckId: string, 
  userId: string, 
  value: number,
  previousValue: number = 0
): Promise<void> {
  try {
    const voteRef = doc(db, 'factChecks', factCheckId, 'votes', userId);
    const factCheckRef = doc(db, 'factChecks', factCheckId);

    await runTransaction(db, async (transaction) => {
      const factCheckDoc = await transaction.get(factCheckRef);
      if (!factCheckDoc.exists()) {
        throw "Fact check does not exist!";
      }

      const factCheck = factCheckDoc.data();
      const currentData = factCheckDoc.data();
      let newUpvotes = currentData.upvotes || 0;
      let newDownvotes = currentData.downvotes || 0;

      // Remove previous vote
      if (previousValue === 1) newUpvotes--;
      if (previousValue === -1) newDownvotes--;

      // Add new vote
      if (value === 1) newUpvotes++;
      if (value === -1) newDownvotes++;

      if (value === 0) {
        transaction.delete(voteRef);
      } else {
        const voteData: Vote = {
          userId,
          value,
          timestamp: serverTimestamp()
        };
        transaction.set(voteRef, voteData);
      }

      transaction.update(factCheckRef, {
        upvotes: newUpvotes,
        downvotes: newDownvotes,
        updatedAt: serverTimestamp()
      });

      // Handle karma for the vote recipient
      if (factCheck.submittedBy && value !== previousValue) {
        // Karma for receiving votes
        if (value === 1) {
          await karmaService.addKarmaHistoryEntry(
            factCheck.submittedBy,
            'FACT_UPVOTED',
            factCheckId
          );
        } else if (value === -1) {
          await karmaService.addKarmaHistoryEntry(
            factCheck.submittedBy,
            'FACT_DOWNVOTED',
            factCheckId
          );
        }

        // Karma for giving votes
        if (value === 1) {
          await karmaService.addKarmaHistoryEntry(
            userId,
            'UPVOTE_GIVEN',
            factCheckId
          );
        } else if (value === -1) {
          // Check if downvoting a validated fact (penalty) or a false fact (reward)
          if (factCheck.moderatorValidation === 'VALIDATED_TRUE') {
            await karmaService.addKarmaHistoryEntry(
              userId,
              'DOWNVOTE_VALIDATED_FACT',
              factCheckId
            );
          } else if (factCheck.moderatorValidation === 'VALIDATED_FALSE') {
            await karmaService.addKarmaHistoryEntry(
              userId,
              'DOWNVOTE_CORRECT',
              factCheckId
            );
          }
        }
      }
    });
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