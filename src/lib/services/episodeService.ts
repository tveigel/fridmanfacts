// src/lib/services/episodeService.ts
import { adminDb } from '../firebase/firebaseAdmin';
import { serializeFirebaseData } from '../utils/time';
import { factCheckService } from './factCheckService';

interface EpisodeData {
  id: string;
  thumbnail: string;
  title: string;
  guest: string;
  date: string;
  video_link: string;
  timestamps: any[];
  transcript: any[];
  factChecks: Record<string, any[]>;
}

export const episodeService = {
  async getAllEpisodes() {
    try {
      const snapshot = await adminDb.collection('episodes')
        .select('id')
        .get();

      if (snapshot.empty) {
        console.log('No episodes found');
        return [];
      }

      return snapshot.docs.map(doc => ({
        id: doc.id
      }));
    } catch (error) {
      console.error('Error fetching all episodes:', error);
      return [];
    }
  },

  async getEpisodeById(id: string): Promise<EpisodeData | null> {
    try {
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
        thumbnail: episodeData?.thumbnail || '',
        title: episodeData?.title || '',
        guest: episodeData?.guest || '',
        date: episodeData?.date || '',
        video_link: episodeData?.video_link || '',
        timestamps: episodeData?.timestamps || [],
        transcript: episodeData?.transcript || [],
        factChecks: organizedFactChecks
      }) as EpisodeData;
    } catch (error) {
      console.error('Error fetching episode:', error);
      throw error;
    }
  }
};