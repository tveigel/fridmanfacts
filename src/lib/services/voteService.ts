// src/lib/services/voteService.ts

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  serverTimestamp,
  runTransaction,
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import type { Vote, KarmaAction, UserVotesMap } from '../types/types';
import { karmaService } from './karmaService';



export const voteService = {
  /**
   * Submits (or updates/removes) a vote for the given factCheck by userId.
   * `value` should be -1 (downvote), 0 (remove vote), or +1 (upvote).
   *
   * This function:
   *   - loads the old vote from Firestore inside a transaction,
   *   - removes the old vote from the fact's counters if needed,
   *   - applies the new vote if needed,
   *   - updates the doc,
   *   - then after the transaction, applies Karma actions to fact owner & voter.
   */

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
    newValue: number
  ): Promise<void> {
    const ownerActions: KarmaAction[] = [];
    const voterActions: KarmaAction[] = [];
    let capturedAuthorId: string | null = null;
  
    try {
      await runTransaction(db, async (transaction) => {
        // 1. Get fact check data
        const factCheckRef = doc(db, 'factChecks', factCheckId);
        const factCheckSnap = await transaction.get(factCheckRef);
        if (!factCheckSnap.exists()) throw new Error('Fact check not found');
        
        const factCheckData = factCheckSnap.data();
        const authorId = factCheckData.submittedBy;
        capturedAuthorId = authorId;
  
        // 2. Get validation status
        const validationStatus = factCheckData.moderatorValidation || factCheckData.status || 'UNVALIDATED';
        
        // 3. Get current vote
        const voteRef = doc(db, 'factChecks', factCheckId, 'votes', userId);
        const oldVoteSnap = await transaction.get(voteRef);
        const oldValue = oldVoteSnap.exists() ? oldVoteSnap.data().value : 0;
  
        if (newValue === oldValue) return;
  


        if (oldValue !== 0 && newValue !== 0 && oldValue !== newValue) {
          // User is changing their vote from up to down or vice versa
          if (authorId !== userId) {
            if (oldValue === 1 && newValue === -1) {
              // Changed from upvote to downvote
              ownerActions.push('FACT_UPVOTE_REMOVED');
              ownerActions.push('FACT_DOWNVOTED');
              
              if (validationStatus === 'VALIDATED_TRUE') {
                voterActions.push('UPVOTE_GIVEN_REMOVED');
                voterActions.push('DOWNVOTE_GIVEN_VALIDATED_TRUE');
              } else if (validationStatus === 'VALIDATED_FALSE') {
                voterActions.push('UPVOTE_GIVEN_VALIDATED_FALSE');
                voterActions.push('DOWNVOTE_GIVEN_VALIDATED_FALSE');
              }
            } else if (oldValue === -1 && newValue === 1) {
              // Changed from downvote to upvote
              ownerActions.push('FACT_DOWNVOTE_REMOVED');
              ownerActions.push('FACT_UPVOTED');
              
              if (validationStatus === 'VALIDATED_TRUE') {
                voterActions.push('DOWNVOTE_VALIDATED_FACT_REMOVED');
                voterActions.push('UPVOTE_GIVEN_VALIDATED_TRUE');
              } else if (validationStatus === 'VALIDATED_FALSE') {
                voterActions.push('DOWNVOTE_CORRECT_REMOVED');
                voterActions.push('UPVOTE_GIVEN_VALIDATED_FALSE');
              }
            }
          }
        }

        // 4. Handle vote removal (when oldValue exists)
        if (oldValue !== 0) {
          if (oldValue === 1) {
            if (authorId !== userId) {
              ownerActions.push('FACT_UPVOTE_REMOVED');
              
              // Special karma handling for removing votes on validated facts
              if (validationStatus === 'VALIDATED_TRUE') {
                voterActions.push('UPVOTE_GIVEN_REMOVED');
              } else if (validationStatus === 'VALIDATED_FALSE') {
                voterActions.push('UPVOTE_GIVEN_VALIDATED_FALSE');
              }
            }
          } else if (oldValue === -1) {
            if (authorId !== userId) {
              ownerActions.push('FACT_DOWNVOTE_REMOVED');
              
              // Special karma handling for removing downvotes
              if (validationStatus === 'VALIDATED_TRUE') {
                voterActions.push('DOWNVOTE_VALIDATED_FACT_REMOVED');
              } else if (validationStatus === 'VALIDATED_FALSE') {
                voterActions.push('DOWNVOTE_CORRECT_REMOVED');
              }
            }
          }
        }
  
        // 5. Handle new vote
        if (newValue !== 0) {
          if (newValue === 1) {
            if (authorId !== userId) {
              ownerActions.push('FACT_OWNER_UPVOTED');
              
              // Different karma for validated vs unvalidated
              if (validationStatus === 'VALIDATED_TRUE') {
                voterActions.push('UPVOTE_GIVEN_VALIDATED_TRUE');
              } else if (validationStatus === 'VALIDATED_FALSE') {
                voterActions.push('UPVOTE_GIVEN_VALIDATED_FALSE');
              } else {
                voterActions.push('UNVALIDATED_FACT_UPVOTED');
              }
            }
          } else if (newValue === -1) {
            if (authorId !== userId) {
              ownerActions.push('FACT_OWNER_DOWNVOTED');
              
              // Different karma for validated vs unvalidated
              if (validationStatus === 'VALIDATED_TRUE') {
                voterActions.push('DOWNVOTE_GIVEN_VALIDATED_TRUE');
              } else if (validationStatus === 'VALIDATED_FALSE') {
                voterActions.push('DOWNVOTE_GIVEN_VALIDATED_FALSE');
              } else {
                voterActions.push('UNVALIDATED_FACT_DOWNVOTED');
              }
            }
          }
        }
  
        // 6. Update vote document
        if (newValue === 0) {
          transaction.delete(voteRef);
        } else {
          transaction.set(voteRef, {
            value: newValue,
            timestamp: serverTimestamp()
          });
        }
  
        // 7. Update fact check vote counts
        let upvotes = factCheckData.upvotes || 0;
        let downvotes = factCheckData.downvotes || 0;
  
        if (oldValue === 1) upvotes--;
        else if (oldValue === -1) downvotes--;
        if (newValue === 1) upvotes++;
        else if (newValue === -1) downvotes++;
  
        transaction.update(factCheckRef, {
          upvotes,
          downvotes,
          updatedAt: serverTimestamp()
        });
      });
  
      // 8. After transaction: apply karma actions
      if (capturedAuthorId && ownerActions.length > 0) {
        for (const action of ownerActions) {
          await karmaService.addKarmaHistoryEntry(
            capturedAuthorId,
            action,
            factCheckId
          );
        }
      }
  
      if (voterActions.length > 0) {
        for (const action of voterActions) {
          await karmaService.addKarmaHistoryEntry(
            userId,
            action,
            factCheckId
          );
        }
      }
    } catch (error) {
      console.error('Error submitting vote:', error);
      throw error;
    }
  },


  /**
   * Returns the total upvotes and downvotes for a given factCheckId.
   */
  async getVoteCounts(factCheckId: string): Promise<{ upvotes: number; downvotes: number }> {
    try {
      const votesRef = collection(db, 'factChecks', factCheckId, 'votes');
      const votesSnapshot = await getDocs(votesRef);

      let upvotes = 0;
      let downvotes = 0;

      votesSnapshot.forEach((docSnap) => {
        const val = docSnap.data().value;
        if (val === 1) upvotes++;
        else if (val === -1) downvotes++;
      });

      return { upvotes, downvotes };
    } catch (error) {
      console.error('Error calculating vote counts:', error);
      throw error;
    }
  },
};
