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
    WriteBatch,
    writeBatch,
    onSnapshot
  } from 'firebase/firestore';
  import { db } from '../firebase/firebaseConfig';
  import type { KarmaAction, KarmaHistoryEntry, UserKarma } from '../types/types';
  
  // Karma point values for different actions
  export const KARMA_POINTS = {
    SUBMIT_FACT: 15,
    FACT_VALIDATED_TRUE: 30,
    FACT_VALIDATED_FALSE: -15,
    FACT_VALIDATED_CONTROVERSIAL: 5,
    FACT_DELETED: -25,
    FACT_UPVOTED: 4,
    FACT_DOWNVOTED: -1,
    SUBMIT_COMMENT: 1,
    COMMENT_UPVOTED: 2,
    COMMENT_DOWNVOTED: -1,
    UPVOTE_GIVEN: 1,
    DOWNVOTE_CORRECT: 2,
    DOWNVOTE_VALIDATED_FACT: -3
  };
  
  export const karmaService = {
    async initializeUserKarma(userId: string): Promise<void> {
      const userKarmaRef = doc(db, 'userKarma', userId);
      
      try {
        await runTransaction(db, async (transaction) => {
          const userKarmaDoc = await transaction.get(userKarmaRef);
          
          if (!userKarmaDoc.exists()) {
            transaction.set(userKarmaRef, {
              userId,
              totalKarma: 10, // Starting karma
              lastUpdated: serverTimestamp()
            });
          }
        });
      } catch (error) {
        console.error('Error initializing user karma:', error);
        throw error;
      }
    },
  
    async getUserKarma(userId: string): Promise<number> {
      try {
        const userKarmaRef = doc(db, 'userKarma', userId);
        const userKarmaDoc = await getDoc(userKarmaRef);
  
        if (!userKarmaDoc.exists()) {
          await this.initializeUserKarma(userId);
          return 10;
        }
  
        return userKarmaDoc.data().totalKarma;
      } catch (error) {
        console.error('Error getting user karma:', error);
        throw error;
      }
    },
  
    async addKarmaHistoryEntry(
      userId: string,
      action: KarmaAction,
      targetId: string
    ): Promise<boolean> {
      try {
        // First check if this exact action was already recorded
        const historyRef = collection(db, 'karmaHistory');
        const q = query(
          historyRef,
          where('userId', '==', userId),
          where('action', '==', action),
          where('targetId', '==', targetId)
        );
        const existing = await getDocs(q);
    
        if (!existing.empty) {
          console.log('Karma action already recorded');
          return false;
        }
    
        // Create a new doc reference for the history entry
        const historyDocRef = doc(collection(db, 'karmaHistory'));
        const userKarmaRef = doc(db, 'userKarma', userId);
    
        await runTransaction(db, async (transaction) => {
          // Do all reads first
          const userKarmaDoc = await transaction.get(userKarmaRef);
    
          // Then do all writes
          const historyEntry = {
            userId,
            action,
            points: KARMA_POINTS[action],
            targetId,
            timestamp: serverTimestamp()
          };
    
          transaction.set(historyDocRef, historyEntry);
    
          if (!userKarmaDoc.exists()) {
            transaction.set(userKarmaRef, {
              userId,
              totalKarma: 10 + KARMA_POINTS[action],
              lastUpdated: serverTimestamp()
            });
          } else {
            transaction.update(userKarmaRef, {
              totalKarma: increment(KARMA_POINTS[action]),
              lastUpdated: serverTimestamp()
            });
          }
        });
    
        return true;
      } catch (error) {
        console.error('Error updating karma:', error);
        throw error; // Changed to throw error for better error handling
      }
    },
  
    async getKarmaHistory(userId: string): Promise<KarmaHistoryEntry[]> {
      try {
        const historyRef = collection(db, 'karmaHistory');
        const q = query(
          historyRef,
          where('userId', '==', userId)
        );
  
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as KarmaHistoryEntry[];
      } catch (error) {
        console.error('Error getting karma history:', error);
        throw error;
      }
    }
  };