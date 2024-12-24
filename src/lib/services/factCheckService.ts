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

      // Update episode stats
      const episodeRef = doc(db, 'episodes', factCheckData.episodeId);
      await updateDoc(episodeRef, {
        factCheckCount: increment(1),
        updatedAt: serverTimestamp()
      });

    // Add karma for submitting a fact check
    await karmaService.addKarmaHistoryEntry(
      factCheckData.submittedBy,
      'SUBMIT_FACT',
      factCheckRef.id
    );

      return factCheckRef.id;
    } catch (error) {
      console.error('Error creating fact check:', error);
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
  
      const factCheck = factCheckDoc.data() as FactCheck;
      
      // Handle karma for validation status changes
      if ('moderatorValidation' in updates && updates.moderatorValidation && factCheck.submittedBy) {
        const previousStatus = factCheck.moderatorValidation;
        const newStatus = updates.moderatorValidation;
  
        // Only update karma if status actually changed
        if (previousStatus !== newStatus) {
          switch (newStatus) {
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
              await karmaService.addKarmaHistoryEntry(
                factCheck.submittedBy,
                'FACT_VALIDATED_CONTROVERSIAL',
                factCheckId
              );
              break;
          }
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
      // Get the fact check data before deletion to access submittedBy
      const factCheckRef = doc(db, 'factChecks', factCheckId);
      const factCheckDoc = await getDoc(factCheckRef);
      
      if (factCheckDoc.exists()) {
        const factCheck = factCheckDoc.data();
        
        // Add negative karma for fact deletion
        if (factCheck.submittedBy) {
          await karmaService.addKarmaHistoryEntry(
            factCheck.submittedBy,
            'FACT_DELETED',
            factCheckId
          );
        }
      }
  
      // Delete the fact check document
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