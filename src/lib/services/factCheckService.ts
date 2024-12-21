// services/firebase/factCheckService.ts
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  doc, 
  updateDoc, 
  increment, 
  serverTimestamp,
  getDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { FactCheck, FactCheckMap } from '../types/types';
import { karmaService } from './karmaService';

export const factCheckService = {
  async getFactChecksForEpisode(episodeId: string): Promise<FactCheck[]> {
    try {
      const q = query(
        collection(db, 'factChecks'),
        where('episodeId', '==', episodeId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as FactCheck));
    } catch (error) {
      console.error('Error fetching fact checks:', error);
      throw error;
    }
  },

  async createFactCheck(factCheckData: Omit<FactCheck, 'id' | 'voteCount' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      // Prepare the fact check data with timestamps and initial vote count
      const fullFactCheckData = {
        ...factCheckData,
        voteCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
  
      // Add the fact check document
      const factCheckRef = await addDoc(collection(db, 'factChecks'), fullFactCheckData);
      
      try {
        // Update episode stats - wrapped in separate try/catch to not fail the whole operation
        const episodeRef = doc(db, 'episodes', factCheckData.episodeId);
        await updateDoc(episodeRef, {
          factCheckCount: increment(1),
          updatedAt: serverTimestamp()
        });
      } catch (statsError) {
        console.warn('Non-critical error updating episode stats:', statsError);
        // Don't throw here as the main operation succeeded
      }
  
      try {
        // Add karma - wrapped in separate try/catch
        await karmaService.addKarmaHistoryEntry(
          factCheckData.submittedBy,
          'SUBMIT_FACT',
          factCheckRef.id
        );
      } catch (karmaError) {
        console.warn('Non-critical error updating karma:', karmaError);
        // Don't throw here as the main operation succeeded
      }
  
      return factCheckRef.id;
    } catch (error) {
      console.error('Error creating fact check:', error);
      if (error.code === 'permission-denied') {
        throw new Error('You do not have permission to create fact checks. Please ensure you are logged in.');
      }
      throw error;
    }
  },


async updateFactCheck(factCheckId: string, updates: Partial<FactCheck>): Promise<void> {
  try {
    const factCheckRef = doc(db, 'factChecks', factCheckId);
    const factCheckDoc = await getDoc(factCheckRef);
    
    if (!factCheckDoc.exists()) {
      throw new Error('Fact check not found');
    }

    const factCheck = factCheckDoc.data();
    
    // Handle karma for validation status changes
    if (updates.moderatorValidation && factCheck.submittedBy) {
      switch (updates.moderatorValidation) {
        case 'VALIDATED_TRUE':
          await karmaService.addKarmaHistoryEntry(
            factCheck.submittedBy,
            'FACT_VALIDATED_TRUE',
            factCheckId
          );
          break;
        case 'VALIDATED_FALSE':
          await karmaService.addKarmaHistoryEntry(
            factCheck.submittedBy,
            'FACT_VALIDATED_FALSE',
            factCheckId
          );
          break;
        case 'VALIDATED_CONTROVERSIAL':
          // Add new karma action for controversial
          await karmaService.addKarmaHistoryEntry(
            factCheck.submittedBy,
            'FACT_VALIDATED_CONTROVERSIAL',
            factCheckId
          );
          break;
      }
    }

    await updateDoc(factCheckRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating fact check:', error);
    throw error;
  }
},

  async deleteFactCheck(factCheckId: string, episodeId: string): Promise<void> {
    try {
      // Delete the fact check document
      const factCheckRef = doc(db, 'factChecks', factCheckId);
      await deleteDoc(factCheckRef);
  
      // Update episode stats
      try {
        const episodeRef = doc(db, 'episodes', episodeId);
        await updateDoc(episodeRef, {
          factCheckCount: increment(-1),
          updatedAt: serverTimestamp()
        });
      } catch (statsError) {
        console.error('Error updating episode stats:', statsError);
        // Don't throw as the main operation (deletion) succeeded
      }
    } catch (error) {
      console.error('Error deleting fact check:', error);
      throw error;
    }
  },

  organizeFactChecksByTime(factChecks: FactCheck[]): FactCheckMap {
    console.log('Organizing fact checks, input:', factChecks);
    
    const organized = factChecks.reduce((acc: FactCheckMap, factCheck) => {
      // Debug log each fact check processing
      console.log('Processing fact check:', {
        id: factCheck.id,
        time: factCheck.transcriptTime,
        status: factCheck.status || factCheck.moderatorValidation,
        text: factCheck.flaggedText
      });

      // Format check
      const transcriptTime = factCheck.transcriptTime;
      console.log('Time format comparison:', {
        original: transcriptTime,
        formatted: transcriptTime
      });

      if (!acc[transcriptTime]) {
        acc[transcriptTime] = [];
      }
      acc[transcriptTime].push(factCheck);
      return acc;
    }, {});

    console.log('Organized result:', organized);
    return organized;
  }
};