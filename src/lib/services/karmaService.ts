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
    writeBatch
  } from 'firebase/firestore';
  import { db } from '../firebase/firebaseConfig';
  import type { KarmaAction, KarmaHistoryEntry, UserKarma } from '../types/types';
  
  // Karma point values for different actions
  const KARMA_POINTS = {
    SUBMIT_FACT: 10,
    FACT_VALIDATED_TRUE: 20,
    FACT_VALIDATED_FALSE: -15,
    FACT_UPVOTED: 2,
    FACT_DOWNVOTED: -1,
    SUBMIT_COMMENT: 1,
    COMMENT_UPVOTED: 1,
    COMMENT_DOWNVOTED: -1,
    UPVOTE_GIVEN: 1,
    DOWNVOTE_CORRECT: 1,
    DOWNVOTE_VALIDATED_FACT: -2
  } as const;
  
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
        // Check if this action was already recorded to prevent farming
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
  
        const batch = writeBatch(db);
  
        // Create history entry
        const historyDocRef = doc(collection(db, 'karmaHistory'));
        const historyEntry = {
          userId,
          action,
          points: KARMA_POINTS[action],
          targetId,
          timestamp: serverTimestamp()
        };
  
        batch.set(historyDocRef, historyEntry);
  
        // Update total karma
        const userKarmaRef = doc(db, 'userKarma', userId);
        const userKarmaDoc = await getDoc(userKarmaRef);
  
        if (!userKarmaDoc.exists()) {
          batch.set(userKarmaRef, {
            userId,
            totalKarma: 10 + KARMA_POINTS[action],
            lastUpdated: serverTimestamp()
          });
        } else {
          batch.update(userKarmaRef, {
            totalKarma: increment(KARMA_POINTS[action]),
            lastUpdated: serverTimestamp()
          });
        }
  
        // Commit the batch
        await batch.commit();
  
        return true;
      } catch (error) {
        console.error('Error updating karma:', error);
        return false;
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