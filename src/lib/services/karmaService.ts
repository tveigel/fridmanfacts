// src/lib/services/karmaService.ts
import { 
  doc, 
  collection,
  getDoc, 
  setDoc, 
  addDoc,
  query,
  where,
  getDocs,
  increment,
  serverTimestamp,
  runTransaction,
  writeBatch,
} from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { db } from '../firebase/firebaseConfig';
import type { KarmaAction, KarmaHistoryEntry, UserKarma } from '../types/types';

// Karma point values for different actions
export const KARMA_POINTS = {
  // Fact submission and validation
  SUBMIT_FACT: 15,                      // User submits a fact
  FACT_VALIDATED_TRUE: 30,              // Fact marked as true
  FACT_VALIDATED_FALSE: -15,            // Fact marked as false
  FACT_VALIDATED_CONTROVERSIAL: 5,      // Fact marked as controversial
  FACT_DELETED: -25,                    // Fact removed by a moderator

  // Voting on facts
  FACT_UPVOTED: 2,                      // Fact upvoted
  FACT_DOWNVOTED: -1,                   // Fact downvoted
  FACT_UPVOTE_REMOVED: -2,              // Upvote on a fact removed
  FACT_DOWNVOTE_REMOVED: 1,             // Downvote on a fact removed

  // Voting on unvalidated facts
  UNVALIDATED_FACT_UPVOTED: 1,          // Upvote on unvalidated fact
  UNVALIDATED_FACT_DOWNVOTED: -1,       // Downvote on unvalidated fact

  // Impact on fact owner
  FACT_OWNER_UPVOTED: 3,                // Owner's fact receives an upvote
  FACT_OWNER_DOWNVOTED: -3,             // Owner's fact receives a downvote

  // Voting behaviors penalized for bias
  UPVOTE_GIVEN_VALIDATED_FALSE: -1,     // Upvote given to a false fact
  DOWNVOTE_GIVEN_VALIDATED_TRUE: -1,    // Downvote given to a true fact
  UPVOTE_GIVEN_VALIDATED_TRUE: 1,       // Upvote given to a true fact (reward good judgment)
  DOWNVOTE_GIVEN_VALIDATED_FALSE: 1,    // Downvote given to a false fact (reward good judgment)

  // Removed votes and their corrections
  UPVOTE_GIVEN_REMOVED: -1,             // Upvote removed
  DOWNVOTE_GIVEN_REMOVED: 1,            // Downvote removed
  DOWNVOTE_CORRECT_REMOVED: -2,         // Correct downvote removed
  DOWNVOTE_VALIDATED_FACT_REMOVED: 3,   // Downvote removed on a validated fact

  // Comment-related actions
  SUBMIT_COMMENT: 1,                    // User submits a comment
  COMMENT_UPVOTED: 2,                   // Comment upvoted
  COMMENT_DOWNVOTED: -1,                // Comment downvoted
};


export const karmaService = {
  async initializeUserKarma(userId: string): Promise<void> {
    if (!userId) return;
  
    try {
      const userKarmaRef = doc(db, 'userKarma', userId);
      const userKarmaDoc = await getDoc(userKarmaRef);
      
      if (!userKarmaDoc.exists()) {
        // Add all required fields explicitly
        await setDoc(userKarmaRef, {
          userId,
          totalKarma: 10,
          lastUpdated: serverTimestamp(),
          // Add any other required fields from your rules
        });
      }
    } catch (error) {
      console.error('Error initializing user karma:', error);
      throw error; // Changed: Now throwing the error to handle it properly
    }
  },

  async getUserKarma(userId: string): Promise<number> {
    if (!userId) return 0;

    try {
      const userKarmaRef = doc(db, 'userKarma', userId);
      const userKarmaDoc = await getDoc(userKarmaRef);

      if (!userKarmaDoc.exists()) {
        await this.initializeUserKarma(userId);
        return 10;
      }

      return userKarmaDoc.data().totalKarma || 0;
    } catch (error) {
      console.error('Error getting user karma:', error);
      return 0;
    }
  },

  async addKarmaHistoryEntry(
    userId: string,
    action: KarmaAction,
    targetId: string
  ): Promise<boolean> {
    // Input validation
    if (!userId || !action || !targetId) {
      console.error('Invalid input parameters for karma entry');
      throw new Error('Missing required parameters for karma entry');
    }
  
    // Validate that the action is valid according to your Firebase rules
    const validKarmaActions = [
      'SUBMIT_FACT',
      'FACT_VALIDATED_TRUE',
      'FACT_VALIDATED_FALSE',
      'FACT_VALIDATED_CONTROVERSIAL',
      'FACT_DELETED',
      'FACT_UPVOTED',
      'FACT_DOWNVOTED',
      'FACT_UPVOTE_REMOVED',
      'FACT_DOWNVOTE_REMOVED',
      'UNVALIDATED_FACT_UPVOTED',
      'UNVALIDATED_FACT_DOWNVOTED',
      'FACT_OWNER_UPVOTED',
      'FACT_OWNER_DOWNVOTED',
      'UPVOTE_GIVEN_VALIDATED_FALSE',
      'DOWNVOTE_GIVEN_VALIDATED_TRUE',
      'UPVOTE_GIVEN_VALIDATED_TRUE',
      'DOWNVOTE_GIVEN_VALIDATED_FALSE',
      'UPVOTE_GIVEN_REMOVED',
      'DOWNVOTE_GIVEN_REMOVED',
      'DOWNVOTE_CORRECT_REMOVED',
      'DOWNVOTE_VALIDATED_FACT_REMOVED',
      'SUBMIT_COMMENT',
      'COMMENT_UPVOTED',
      'COMMENT_DOWNVOTED'
    ];
  
    if (!validKarmaActions.includes(action)) {
      console.error(`Invalid karma action: ${action}`);
      throw new Error('Invalid karma action type');
    }
  
    try {
      const historyRef = collection(db, 'karmaHistory');
      const userKarmaRef = doc(db, 'userKarma', userId);
  
      // Use transaction to ensure atomic updates
      return await runTransaction(db, async (transaction) => {
        // Check for existing entry to prevent duplicates
        const q = query(
          historyRef,
          where('userId', '==', userId),
          where('action', '==', action),
          where('targetId', '==', targetId)
        );
        
        const existing = await getDocs(q);
        if (!existing.empty) {
          console.log('Karma entry already exists');
          return false;
        }
  
        // Get the karma points for this action
        const karmaPoints = KARMA_POINTS[action] || 0;
  
        // Create new history entry with ALL required fields
        const historyDocRef = doc(collection(db, 'karmaHistory'));
        const timestamp = serverTimestamp();
        
        const historyEntry = {
          userId,
          action,
          points: karmaPoints,
          targetId,
          timestamp,
          // Add any additional fields required by your rules here
        };
  
        // Get or create karma document
        const userKarmaDoc = await transaction.get(userKarmaRef);
  
        if (!userKarmaDoc.exists()) {
          // Initialize user karma with all required fields
          transaction.set(userKarmaRef, {
            userId,
            totalKarma: 10 + karmaPoints, // Starting karma (10) plus new points
            lastUpdated: timestamp,
            // Add any additional fields required by your rules here
          });
        } else {
          // Update existing karma
          transaction.update(userKarmaRef, {
            totalKarma: increment(karmaPoints),
            lastUpdated: timestamp,
            // Update any additional fields required by your rules here
          });
        }
  
        // Add the history entry
        transaction.set(historyDocRef, historyEntry);
  
        return true;
      });
    } catch (error) {
      // Log the full error for debugging
      console.error('Error in addKarmaHistoryEntry:', error);
      
      // Throw a more specific error based on the type
      if (error instanceof FirebaseError) {
        if (error.code === 'permission-denied') {
          throw new Error('Permission denied while updating karma. Please check authentication.');
        } else {
          throw new Error(`Firebase error while updating karma: ${error.message}`);
        }
      }
      
      // For other types of errors
      throw new Error(`Failed to update karma: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async getKarmaHistory(userId: string): Promise<KarmaHistoryEntry[]> {
    if (!userId) return [];

    try {
      const historyRef = collection(db, 'karmaHistory');
      const q = query(
        historyRef,
        where('userId', '==', userId),
        where('timestamp', '!=', null)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as KarmaHistoryEntry[];
    } catch (error) {
      console.error('Error getting karma history:', error);
      return [];
    }
  }
};