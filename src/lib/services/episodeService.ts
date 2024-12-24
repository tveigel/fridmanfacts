// src/lib/services/episodeService.ts
import { adminDb } from '../firebase/firebaseAdmin';
import { serializeFirebaseData } from '../utils/time';
import { factCheckService } from './factCheckService';

export const episodeService = {
  async getEpisodeById(id: string) {
    const docRef = adminDb.collection('episodes').doc(id);
    const docSnap = await docRef.get();
    
    if (!docSnap.exists) {
      return null;
    }

    const episodeData = docSnap.data();
    const factChecks = await factCheckService.getFactChecksForEpisode(id);
    const organizedFactChecks = factCheckService.organizeFactChecksByTime(factChecks);
    
    return serializeFirebaseData({
      id,
      ...episodeData,
      factChecks: organizedFactChecks
    });
  }
};