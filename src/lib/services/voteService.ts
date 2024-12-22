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
    newValue: number // -1, 0, or +1
  ): Promise<void> {
    // We'll collect karma actions, then handle them AFTER the transaction.
    const ownerActions: KarmaAction[] = [];
    const voterActions: KarmaAction[] = [];

    // We need to capture the authorId so we can reference it safely *after* the transaction
    let capturedAuthorId: string | null = null;

    try {
      await runTransaction(db, async (transaction) => {
        // 1. References
        const factCheckRef = doc(db, 'factChecks', factCheckId);
        const voteRef = doc(db, 'factChecks', factCheckId, 'votes', userId);

        // 2. Get the factCheck
        const factCheckSnap = await transaction.get(factCheckRef);
        if (!factCheckSnap.exists()) {
          throw new Error('Fact check not found');
        }
        const factCheckData = factCheckSnap.data();
        const authorId = factCheckData.submittedBy as string;
        capturedAuthorId = authorId; // <--- capture it for use outside

        // We'll read validation status from factCheckData.status
        let validationStatus = factCheckData.status || 'UNVALIDATED';
        // If "VALIDATED_CONTROVERSIAL", treat as unvalidated for awarding voter karma:
        if (validationStatus === 'VALIDATED_CONTROVERSIAL') {
          validationStatus = 'UNVALIDATED';
        }

        let upvotes = factCheckData.upvotes || 0;
        let downvotes = factCheckData.downvotes || 0;

        // 3. Get the old vote from Firestore
        const oldVoteSnap = await transaction.get(voteRef);
        const oldValue = oldVoteSnap.exists()
          ? (oldVoteSnap.data().value as number)
          : 0;

        // If newValue == oldValue, no change is needed.
        if (newValue === oldValue) {
          return; // early return, no changes
        }

        // 4. Remove the old vote from counters if oldValue != 0
        if (oldValue === 1) {
          upvotes = Math.max(0, upvotes - 1);
          if (authorId !== userId) {
            // Fact owner loses 'FACT_UPVOTED' => 'FACT_UPVOTE_REMOVED'
            ownerActions.push('FACT_UPVOTE_REMOVED');
            // Voter removing an upvote => 'UPVOTE_GIVEN_REMOVED'
            voterActions.push('UPVOTE_GIVEN_REMOVED');
          }
        } else if (oldValue === -1) {
          downvotes = Math.max(0, downvotes - 1);
          if (authorId !== userId) {
            // Fact owner loses 'FACT_DOWNVOTED' => 'FACT_DOWNVOTE_REMOVED'
            ownerActions.push('FACT_DOWNVOTE_REMOVED');
            // Voter removing a downvote
            switch (factCheckData.status) {
              case 'VALIDATED_FALSE':
                voterActions.push('DOWNVOTE_CORRECT_REMOVED');
                break;
              case 'VALIDATED_TRUE':
                voterActions.push('DOWNVOTE_VALIDATED_FACT_REMOVED');
                break;
              default:
                voterActions.push('DOWNVOTE_GIVEN_REMOVED');
                break;
            }
          }
        }

        // 5. Add the new vote (if newValue != 0)
        if (newValue === 1) {
          upvotes += 1;
          if (authorId !== userId) {
            ownerActions.push('FACT_UPVOTED');
          }
          // For the voter:
          switch (factCheckData.status) {
            case 'VALIDATED_TRUE':
              voterActions.push('UPVOTE_GIVEN_VALIDATED_TRUE');
              break;
            case 'VALIDATED_FALSE':
              voterActions.push('UPVOTE_GIVEN_VALIDATED_FALSE');
              break;
            default:
              // UNVALIDATED or VALIDATED_CONTROVERSIAL
              voterActions.push('UNVALIDATED_FACT_UPVOTED');
          }
        } else if (newValue === -1) {
          downvotes += 1;
          if (authorId !== userId) {
            ownerActions.push('FACT_DOWNVOTED');
          }
          // For the voter:
          switch (factCheckData.status) {
            case 'VALIDATED_TRUE':
              voterActions.push('DOWNVOTE_GIVEN_VALIDATED_TRUE');
              break;
            case 'VALIDATED_FALSE':
              voterActions.push('DOWNVOTE_GIVEN_VALIDATED_FALSE');
              break;
            default:
              // UNVALIDATED or VALIDATED_CONTROVERSIAL
              voterActions.push('UNVALIDATED_FACT_DOWNVOTED');
          }
        }

        // 6. Update or delete the vote doc
        if (newValue === 0) {
          // remove the vote entirely
          transaction.delete(voteRef);
        } else {
          // upvote or downvote
          transaction.set(voteRef, {
            value: newValue,
            timestamp: serverTimestamp(),
          });
        }

        // 7. Update the factCheck counters
        transaction.update(factCheckRef, {
          upvotes,
          downvotes,
          updatedAt: serverTimestamp(),
        });
      });

      // 8. After transaction: apply karma actions
      // IMPORTANT: we now use `capturedAuthorId` here instead of `factCheckData`.
      if (capturedAuthorId && ownerActions.length > 0) {
        // Check if these owner actions truly apply:
        const hasOwnerAction =
          ownerActions.includes('FACT_UPVOTED') ||
          ownerActions.includes('FACT_UPVOTE_REMOVED') ||
          ownerActions.includes('FACT_DOWNVOTED') ||
          ownerActions.includes('FACT_DOWNVOTE_REMOVED');

        if (hasOwnerAction) {
          for (const action of ownerActions) {
            await karmaService.addKarmaHistoryEntry(
              capturedAuthorId,
              action,
              factCheckId
            );
          }
        }
      }

      if (voterActions.length > 0) {
        for (const action of voterActions) {
          await karmaService.addKarmaHistoryEntry(userId, action, factCheckId);
        }
      }
    } catch (error) {
      console.error('Error submitting vote:', error);
      throw error; // Re-throw so caller sees the error
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
